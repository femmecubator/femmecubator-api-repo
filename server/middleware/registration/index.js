const bcrypt = require('bcrypt');
const {
  HttpStatusCodes: { StatusCodes },
  DataException
} = require('../../utils/constants');
const { REQUEST_TIMEOUT, OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const JWT = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const registrationLogger = require('./registrationLogger');

const validateFormFields = ({ body }) => {
  const formFields = ['firstName', 'lastName', 'title', 'email', 'password'];
  const saltRounds = 10;

  formFields.forEach(field => {
    if (!Object.hasOwnProperty.call(body, field)) {
      throw Error('Bad request');
    }
  });
  const { password, ...rest } = body;
  const userPayload = { password: bcrypt.hashSync(password, saltRounds), ...rest };
  return userPayload;
};

const register = async (req, res) => {
  let data;
  let statusCode;
  let message;
  let collectionObj;

  const { email } = req.body;
  registrationLogger.start(email);

  try {
    const userPayload = validateFormFields(req);
    collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
    let insertion = await collectionObj.insertOne({ ...userPayload });
    data = insertion.ops[0];
    if (!data) {
      statusCode = REQUEST_TIMEOUT;
      throw DataException(`Service Unavailable - There was a problem with your request. Please try again later`);
    } else {
      statusCode = OK;
      message = 'Success'
    }
    const cookieExp = new Date(Date.now() + 8 * 3600000);
    const options = {
      expires: cookieExp,
      path: '/',
      domain: process.env.DOMAIN || 'femmecubator.com',
    };
    const token = JWT.sign(userPayload, process.env.SECRET_KEY);

    res
      .status(OK)
      .cookie('TOKEN', token, options)
      .cookie('SESSIONID', uuid(), options)
      .end();
    registrationLogger.success(email);
  } catch (error) {
    if (error) {
      registrationLogger.error(error, email);
      statusCode = BAD_REQUEST;
    } else {
      registrationLogger.timeout(email);
      statusCode = GATEWAY_TIMEOUT;
    }
    res
      .status(statusCode)
      .json({ data })
      .end();
  } finally {
    registrationLogger.end(email);
  }
};

const registrationMiddleware = { register };

module.exports = registrationMiddleware;

