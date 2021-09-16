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

const updateProfileData = async (req, res) => {
  let data;
  let statusCode;
  let message;
  try {
    const { USERS_COLLECTION } = process.env;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    if (userCollection) {
      const updateProfile = await userCollection.findOneAndUpdate(
        { email: req.body.email },
        { $set: req.body }
      );
      if (updateProfile.lastErrorObject.updatedExisting) {
        statusCode = OK;
        message = 'Success';
        updateProfile.lastErrorObject = undefined;
        data = updateProfile;
      } else {
        statusCode = 401;
        throw Error('User does not exist!');
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

const updatePassword = async (req, res) => {
  let data;
  let statusCode;
  let message;
  const { USERS_COLLECTION } = process.env;
  try {
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    if (userCollection) {
      const userData = await userCollection.findOne({ email: req.body.email });
      if (userData) {
        const isMatchPassword = await bcrypt.compare(
          req.body.currentPassword,
          userData.password
        );
        if (isMatchPassword) {
          const hashedPassword = await bcrypt.hashSync(
            req.body.newPassword,
            10
          );
          if (hashedPassword) {
            const updatePassword = await userCollection.findOneAndUpdate(
              { email: req.body.email },
              { $set: { password: hashedPassword } }
            );
            statusCode = OK;
            message = 'Password updated successfully';
            data = {};
          }
        } else {
          statusCode = BAD_REQUEST;
          throw Error('Wrong Password. Try Again');
        }
      } else {
        statusCode = 401;
        throw Error('User does not exist!');
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
