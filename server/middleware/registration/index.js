const bcrypt = require('bcryptjs');
const cryptoRandomString = require('random-base64-string');
const {
  HttpStatusCodes: { StatusCodes },
} = require('../../utils/constants');
const { OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');
const registrationLogger = require('./registrationLogger');
const generateCookie = require('../../utils/generateCookie');
const nodemailer = require('nodemailer');

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
    'token',
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
    token: cryptoRandomString(25),
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
    console.log(userPayload);
    email = req.body.email;

    //  if (!isFormValid(req)) throw Error('Bad request');

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
const sendEmail = async (req, res) => {
  let data;
  let statusCode;
  let message;
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  const { email } = req.body;
  try {
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const user = await userCollection.findOne({ email });
    const token = user.token;
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '',
        pass: '',
      },
    });

    var mailOptions = {
      from: 'femmecubator <prbisht3@gmail.com>',
      to: 'preeti.bisht@catalyst.sh',
      subject: 'Reset your account password',
      html:
        "Dear User,<br/>  To reset your password, please click or copy the link below. <br/> <a href='http://local.femmecubator.com:3000/resetPassword/?token=" +
        token +
        '&email=' +
        email +
        "'>http://local.femmecubator.com:3000/resetPassword/?token=" +
        token +
        '&email=' +
        email +
        '</a> <br /> Best Regards, <br /> Femmecubator Team <br /><br /> ',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    statusCode = OK;
    message = 'Success';
    data = {};
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
      logger.error(
        setLogDetails(
          'profileMiddleware.resetPassword',
          'Failed to reset user password'
        )
      );
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};

const resetPassword = async (req, res) => {
  let data;
  let statusCode;
  let message;
  const saltRounds = 10;
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  try {
    const { token, email, newPassword } = req.body;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const matched = userCollection.findOne({
      $and: [{ email: email }, { token: token }],
    });
    if (!matched) {
      statusCode = 401;
      throw Error('User does not exist!');
    }

    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    if (hashedPassword) {
      const resetPassword = await userCollection.findOneAndUpdate(
        { email: email },
        { $set: { password: hashedPassword } }
      );
      if (!resetPassword || TEST_TIMEOUT) {
        throw Error('Gateway Timeout');
      } else {
        statusCode = OK;
        message = 'Success';
        data = {};
      }
    }
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
      logger.error(
        setLogDetails(
          'profileMiddleware.resetPassword',
          'Failed to reset user password',
          `email - ${email}`
        )
      );
    } else {
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
  },
  forgotPassword: async (req, res) => {
    const { statusCode, ...rest } = await sendEmail(req, res);
    res.status(statusCode).send(rest);
  },
  resetPassword: async (req, res) => {
    const { statusCode, ...rest } = await resetPassword(req, res);
    res.status(statusCode).send(rest);
  },
};

module.exports = registrationMiddleware;
