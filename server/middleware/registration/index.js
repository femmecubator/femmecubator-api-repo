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
    const field = formFields[i];
    if (!Object.hasOwnProperty.call(body, formFields[i]) || body[field].length == 0) {
      return false;
    }
  }
  return true;
};

const isEmailInUse = async (userCollection, email) => {
  const foundUser = await userCollection.findOne(
    { email: email },
    { projection: {email: 1} },
  );
  return foundUser ? true : false;
};

const hashForm = ({ body }) => {
  const saltRounds = 10;
  body.email = body.email.toLowerCase();
  const { password, ...rest } = body;
  const userPayload = { password: bcrypt.hashSync(password, saltRounds), ...rest };
  return userPayload;
};

const generateCookie = (res, userPayload) => {
  const { DOMAIN, SECRET_KEY } = process.env;
  const { password, ...rest } = userPayload;
  const cookieExp = new Date(Date.now() + 8 * 3600000);
  const options = {
    expires: cookieExp,
    path: '/',
    domain: DOMAIN || 'femmecubator.com',
  };
  const token = JWT.sign(rest, SECRET_KEY);
  res.cookie('TOKEN', token, options).cookie('SESSIONID', v4(), options);
};

const createNewUser = async (req, res) => {
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  let data;
  let statusCode;
  let message;
  let email;

  try {
    if (!isFormValid(req)) throw Error('Bad request');
    
    const userPayload = hashForm(req);
    email = req.body.email;

    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const userFound = await userCollection.findOne(
      { email: email },
      { projection: {email: 1} },
    );
    if (userFound) throw Error('Email already in use');

    const insertion = await userCollection.insertOne(userPayload);
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
    if (error && !TEST_TIMEOUT) {
      registrationLogger.error(error, email);
      statusCode = BAD_REQUEST;
      message = error.message;
    } else {
      registrationLogger.timeout(email);
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
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

