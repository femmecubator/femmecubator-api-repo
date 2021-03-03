const bcrypt = require('bcrypt');
const {
  HttpStatusCodes: { StatusCodes },
  DataException,
} = require('../../utils/constants');
const { REQUEST_TIMEOUT, OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const isFormValid = ({ body }) => {
  const formFields = ['email', 'password'];

  formFields.forEach((field) => {
    if (!Object.hasOwnProperty.call(body, field) || body[field].length === 0) {
      return false;
    }
  });

  const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailPattern.test(body.email)) {
    return false;
  } else {
    return true;
  }
};

const generateCookie = (res, userData) => {
  const { DOMAIN, SECRET_KEY } = process.env;
  const cookieExp = new Date(Date.now() + 8 * 3600000);
  const options = {
    expires: cookieExp,
    path: '/',
    domain: DOMAIN || 'femmecubator.com',
  };
  const token = JWT.sign(userData, SECRET_KEY);
  res.cookie('TOKEN', token, options).cookie('SESSIONID', v4(), options);
};

const loginUser = async (req, res) => {
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  let data;
  let statusCode;
  let message;
  let email;
  let sentPassword;

  try {
    email = req.body.email;
    sentPassword = req.body.password;

    if (!isFormValid(req)) throw Error('Bad request');

    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const userFound = await userCollection.findOne({ email });

    if (!userFound) {
      statusCode = 409;
      throw Error('Wrong credentials');
    }

    const isMatch = await bcrypt.compare(sentPassword, userFound.password);

    if (!isMatch) {
      statusCode = 409;
      throw Error('Wrong credentials');
    }

    const { _id, password, ...rest } = userFound.ops[0];
    data = rest;

    if (!data) {
      statusCode = REQUEST_TIMEOUT;
      throw DataException(
        `Service Unavailable - There was a problem with your request. Please try again later`
      );
    } else {
      generateCookie(res, data);
      statusCode = OK;
      message = 'Success';
      //   loginLogger.success(email);
    }
  } catch (error) {
    if (error && !TEST_TIMEOUT) {
      //   loginLogger.error(error, email);
      statusCode = statusCode || BAD_REQUEST;
      message = error.message;
    } else {
      //   loginLogger.timeout(email);
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  } finally {
    // loginLogger.end(email);
  }
  return resObj(statusCode, message, data);
};

const loginMiddleware = {
  register: async (req, res) => {
    const { statusCode, ...rest } = await loginUser(req, res);
    res.status(statusCode).send(rest);
  },
};

module.exports = loginMiddleware;
