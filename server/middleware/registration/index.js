const bcrypt = require('bcrypt');
const {
  HttpStatusCodes: { StatusCodes },
  DataException
} = require('../../utils/constants');
const { REQUEST_TIMEOUT, OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');
const registrationLogger = require('./registrationLogger');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const isFormValid = ({ body }) => {
  const formFields = ['role_id', 'firstName', 'lastName', 'title', 'email', 'password'];
  
  for (let i = 0; i < formFields.length; i++) {
    if (!Object.hasOwnProperty.call(body, formFields[i])) return false;
  }
  return true;
};

const hashForm = ({ body }) => {
  const saltRounds = 10;
  const { password, ...rest } = body;
  const userPayload = { password: bcrypt.hashSync(password, saltRounds), ...rest };
  return userPayload;
};

const generateCookie = (res, userPayload) => {
  const { password, ...rest } = userPayload;
  const cookieExp = new Date(Date.now() + 8 * 3600000);
  const options = {
    expires: cookieExp,
    path: '/',
    domain: process.env.DOMAIN || 'femmecubator.com',
  };
  const token = JWT.sign(rest, process.env.SECRET_KEY);
  res.cookie('TOKEN', token, options).cookie('SESSIONID', v4(), options);
};

const createNewUser = async (req, res) => {
  let data;
  let statusCode;
  let message;

  const { email } = req.body;
  registrationLogger.start(email);

  try {
    if (!isFormValid(req)) throw Error('Bad request');
    
    const userPayload = hashForm(req);
    const collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
    const insertion = await collectionObj.insertOne({ ...userPayload });
    const { _id, password, ...rest } = insertion.ops[0];
    data = rest;
    
    if (!data) {
      statusCode = REQUEST_TIMEOUT;
      throw DataException(`Service Unavailable - There was a problem with your request. Please try again later`);
    } else {
      generateCookie(res, userPayload);
      statusCode = OK;
      message = 'Success';
      registrationLogger.success(email);
    }
  } catch (error) {
    if (error) {
      registrationLogger.error(error, email);
      statusCode = BAD_REQUEST;
    } else {
      registrationLogger.timeout(email);
      statusCode = GATEWAY_TIMEOUT;
    }
    message = error.message;
  } finally {
    registrationLogger.end(email);
  }
  return resObj(statusCode, message, data);
};

const registrationMiddleware = {
  register: async (req, res) => {
    const { statusCode, ...rest } = await createNewUser(req, res);
    res.status(statusCode).send(rest);
  }
};

module.exports = registrationMiddleware;

