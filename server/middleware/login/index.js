const bcrypt = require('bcryptjs');
const {
  HttpStatusCodes: { StatusCodes },
  DataException,
} = require('../../utils/constants');
const { REQUEST_TIMEOUT, OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const authLogger = require('../../utils/authLogger');
const generateCookie = require('../../utils/generateCookie');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});


const loginUser = async (req, res) => {
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  let data;
  let statusCode;
  let message;
  let email;
  let sentPassword;
  const loggerMiddleware = {
    middlewarePath: 'login',
    subMiddleware: 'login',
  };

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

    const { password, ...rest } = userFound;
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
      authLogger.success(email, loggerMiddleware);
    }
  } catch (error) {
    if (error && !TEST_TIMEOUT) {
      authLogger.error(error, email, loggerMiddleware);
      statusCode = statusCode || BAD_REQUEST;
      message = error.message;
    } else {
      authLogger.timeout(email, loggerMiddleware);
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  } finally {
    authLogger.end(email, loggerMiddleware);
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
