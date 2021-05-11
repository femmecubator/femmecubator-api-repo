const bcrypt = require('bcryptjs');
const {
  HttpStatusCodes: { StatusCodes },
  DataException,
} = require('../../utils/constants');
const { REQUEST_TIMEOUT, OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');
const authLogger = require('../../utils/authLogger');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const generateCookie = (res, userData) => {
  const { DOMAIN, SECRET_KEY } = process.env;
  const cookieExp = new Date(Date.now() + 8 * 3600000);
  const options = {
    expires: cookieExp,
    path: '/',
    domain: DOMAIN || 'femmecubator.com',
  };
  console.log("from the back", userData);
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
    email = req.body.email.toLowerCase();
    sentPassword = req.body.password;

    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const userFound = await userCollection.findOne({ email }, {projection: {_id: 0}});

    if (!userFound) {
      statusCode = 401;
      throw Error('Wrong credentials');
    }

    const isMatch = await bcrypt.compare(sentPassword, userFound.password);
    if (!isMatch) {
      statusCode = 401;
      throw Error('Wrong credentials');
    }

    const { _id, password, ...rest } = userFound;
    data = rest;
    console.log("FROM THE LOGIN", data);
    if (!data) {
      statusCode = REQUEST_TIMEOUT;
      throw DataException(
        `Service Unavailable - There was a problem with your request. Please try again later`
      );
    } else {
      generateCookie(res, data);
      statusCode = OK;
      message = 'Success';
      authLogger.success(email, 'login');
    }
  } catch (error) {
    if (error && !TEST_TIMEOUT) {
      authLogger.error(error, email, 'login');
      statusCode = statusCode || BAD_REQUEST;
      message = error.message;
    } else {
      authLogger.timeout(email, 'login');
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  } finally {
    authLogger.end(email, 'login');
  }
  return resObj(statusCode, message, data);
};

const loginMiddleware = {
  login: async (req, res) => {
    const { statusCode, ...rest } = await loginUser(req, res);
    res.status(statusCode).send(rest);
  },
};

module.exports = loginMiddleware;
