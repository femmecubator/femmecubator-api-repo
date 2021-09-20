const bcrypt = require('bcryptjs');
const {
  HttpStatusCodes: { StatusCodes },
} = require('../../utils/constants');
const { OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');
const registrationLogger = require('./registrationLogger');
const generateCookie = require('../../utils/generateCookie');

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
    'password',
  ];

  for (let i = 0; i < formFields.length; i++) {
    const field = formFields[i];
    if (
      !Object.hasOwnProperty.call(body, formFields[i]) ||
      body[field].length === 0
    ) {
      return false;
    }
  }

  const emailPattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
  const userPayload = {
    password: bcrypt.hashSync(password, saltRounds),
    email,
    title,
    role_id: parseInt(role_id),
    lastName,
    firstName,
    hasOnboarded: false,
  };
  return userPayload;
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
      { projection: { email: 1 } }
    );
    if (userFound) {
      statusCode = 409;
      throw Error('Email already in use');
    }

    const insertion = await userCollection.insertOne(userPayload);
    const { password, ...rest } = insertion.ops[0];
    data = rest;

    if (!data || TEST_TIMEOUT) {
      throw Error('Gateway Timeout');
    } else {
      generateCookie(res, data);
      statusCode = OK;
      message = 'Success';
      registrationLogger.success(email);
    }
  } catch (error) {
    if (error.message !== 'Gateway Timeout') {
      registrationLogger.error(error, email);
      statusCode = statusCode || BAD_REQUEST;
      message = error.message;
    } else {
      registrationLogger.timeout(email);
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway Timeout';
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
  },
};

module.exports = registrationMiddleware;
