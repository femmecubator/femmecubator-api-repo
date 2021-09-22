const {
  HttpStatusCodes: { StatusCodes },
} = require('../../utils/constants');
const { OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const bcrypt = require('bcryptjs');
const generateCookie = require('../../utils/generateCookie');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const createPayload = ( body ) => {
  const {
    email,
    firstName,
    lastName,
    title
  } = body;
  return {
    ...(email ? { email: email.toLowerCase() } : {}),
    ...(firstName ? { firstName: firstName } : {}),
    ...(lastName ? { lastName: lastName } : {}),
    ...(title ? { title: title } : {})
  };
};

const updateProfileData = async (req, res, tokenData) => {
  let data;
  let statusCode;
  let message;
  try {
    const userPayload = createPayload(req.body);
    const { USERS_COLLECTION } = process.env;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const updateProfile = await userCollection.findOneAndUpdate(
      { email: tokenData.email },
      { $set: userPayload },
      { returnOriginal: false }
    );
    if (!updateProfile.value) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    const { password, ...rest } = updateProfile.value;
    generateCookie(res, rest);
    statusCode = OK;
    message = 'Success';
    data = rest;
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};

const updatePassword = async (req, res, tokenData) => {
  let data;
  let statusCode;
  let message;
  const saltRounds = 10;
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  try {
    let { currentPassword, newPassword } = req.body;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const userData = await userCollection.findOne({ email: tokenData.email });
    if (!userData) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    const isMatchPassword = await bcrypt.compare(
      currentPassword,
      userData.password
    );
    if (!isMatchPassword) {
      statusCode = BAD_REQUEST;
      throw Error('Wrong Password. Try Again');
    }
    const hashedPassword = await bcrypt.hashSync(newPassword, saltRounds);
    if (hashedPassword) {
      const updatePassword = await userCollection.findOneAndUpdate(
        { email: req.body.email },
        { $set: { password: hashedPassword } }
      );
      if (!updatePassword || TEST_TIMEOUT) {
        throw Error('Gateway Timeout');
      } else {
        statusCode = OK;
        message = 'Password updated successfully';
        data = {};
      }
    }
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};
const getProfileData = async ({ email }) => {
  let data;
  let statusCode;
  let message;
  try {
    const { USERS_COLLECTION } = process.env;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const profileData = await userCollection.findOne({
      email: email,
    });
    if (!profileData) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    profileData.password = undefined;
    statusCode = OK;
    message = 'Success';
    data = profileData;
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};
const profileMiddleware = {
  updateProfile: async (req, res) => {
    var tokenData = res.locals.user;
    const { statusCode, ...rest } = await updateProfileData(
      req,
      res,
      tokenData
    );
    res.status(statusCode).send(rest);
  },
  updatePassword: async (req, res) => {
    var tokenData = res.locals.user;
    const { statusCode, ...rest } = await updatePassword(req, res, tokenData);
    res.status(statusCode).send(rest);
  },
  getProfileData: async (req, res) => {
    var tokenData = res.locals.user;
    const { statusCode, ...rest } = await getProfileData(tokenData);
    res.status(statusCode).send(rest);
  },
};

module.exports = profileMiddleware;
