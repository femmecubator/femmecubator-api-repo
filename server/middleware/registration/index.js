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
  const formFields = [
    // 'role_id',
    'firstName',
    'lastName',
    'title',
    'email',
    'password'
  ];
  
  for (let i = 0; i < formFields.length; i++) {
    const field = formFields[i];
    if (!Object.hasOwnProperty.call(body, formFields[i]) || body[field].length === 0) {
      return false;
    }
  }

  const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailPattern.test(body.email)) {
    return false;
  } else {
    return true;
  }

};

const hashForm = ({ body }) => {
  const saltRounds = 10;
  body.email = body.email.toLowerCase();
  const { password, email, title, role_id, lastName, firstName } = body;
  const userPayload = { password: bcrypt.hashSync(password, saltRounds), email, title, role_id, lastName, firstName };
  return userPayload;
};

const generateCookie = (res, userPayload) => {
  const { DOMAIN, SECRET_KEY } = process.env;
  const { email, role_id, firstName, lastName } = userPayload;
  const cookieExp = new Date(Date.now() + 8 * 3600000);
  const options = {
    expires: cookieExp,
    path: '/',
    domain: DOMAIN || 'femmecubator.com',
  };
  const token = JWT.sign({email, role_id, userName: `${firstName} ${lastName[0]}.`}, SECRET_KEY);
  res.cookie('TOKEN', token, options).cookie('SESSIONID', v4(), options);
};

const createNewUser = async (req, res) => {
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  let data;
  let statusCode;
  let message;
  let email;

  try {
    const userPayload = hashForm(req);
    email = req.body.email;
    
    if (!isFormValid(req)) throw Error('Bad request');

    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const userFound = await userCollection.findOne(
      { email: email },
      { projection: {email: 1} },
    );
    if (userFound) {
      statusCode = 409;
      throw Error('Email already in use');
    }

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
      statusCode = statusCode || BAD_REQUEST;
      message = error.message;
    } else {
      registrationLogger.timeout(email);
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
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

