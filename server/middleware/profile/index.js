const {
  HttpStatusCodes: { StatusCodes },
} = require('../../utils/constants');
const { OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const bcrypt = require('bcryptjs');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const createPayload = ({ body }) => {
  body.email = body.email.toLowerCase();
  const { email, firstName, lastName, title, bio, skills, phone, timezone, googlemeet } = body;
  return {
    ...(email ? { email: email } : {}),
    ...(firstName ? { firstName: firstName } : {}),
    ...(lastName ? { lastName:lastName } : {}),
    ...(title ? { title: title } : {}),
    ...(bio ? { bio: bio } : {}),
    ...(skills ? { skills:skills } : {}),
    ...(phone ? { phone: phone } : {}),
    ...(timezone ? { timezone: timezone } : {}),
    ...(googlemeet ? { googlemeet:googlemeet } : {}),
  };
};

const updateProfileData = async (req, res) => {
  let data;
  let statusCode;
  let message;
  let email;
  try {
    const userPayload = createPayload(req);
    email = userPayload.email;
    const { USERS_COLLECTION } = process.env;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const updateProfile = await userCollection.findOneAndUpdate(
      { email: email },
      { $set: userPayload }
    );
    if (!updateProfile.value) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    const { _id, password, ...rest } = updateProfile.value;
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

const updatePassword = async (req, res) => {
  let data;
  let statusCode;
  let message;
  let email;
  const saltRounds = 10;
  const { USERS_COLLECTION, TEST_TIMEOUT } = process.env;
  try {
    email = req.body.email.toLowerCase();
    let { currentPassword, newPassword } = req.body;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const userData = await userCollection.findOne({ email: email });
    if (!userData) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    const isMatchPassword = await bcrypt.compare(currentPassword, userData.password);
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

const profileMiddleware = {
  updateProfile: async (req, res) => {
    const { statusCode, ...rest } = await updateProfileData(req, res);
    res.status(statusCode).send(rest);
  },
  updatePassword: async (req, res) => {
    const { statusCode, ...rest } = await updatePassword(req, res);
    res.status(statusCode).send(rest);
  },
};

module.exports = profileMiddleware;
