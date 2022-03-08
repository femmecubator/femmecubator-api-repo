const {
  HttpStatusCodes: { StatusCodes },
} = require('../../utils/constants');
const { OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const bcrypt = require('bcryptjs');
const generateCookie = require('../../utils/generateCookie');
const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails } = require('../../utils/constants');

var ObjectId = require('mongodb').ObjectID;

const rolesData = {
  mentor: 0,
  mentee: 1,
  admin: 4,
};

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const createPayload = (body) => {
  const { email, firstName, lastName, title, hasOnboarded } = body;
  return {
    ...(email ? { email: email.toLowerCase() } : {}),
    ...(firstName ? { firstName: firstName } : {}),
    ...(lastName ? { lastName: lastName } : {}),
    ...(title ? { title: title } : {}),
    ...(hasOnboarded ? { hasOnboarded: hasOnboarded } : {}),
  };
};

const updateProfileData = async (req, res, tokenData) => {
  let data;
  let statusCode;
  let message;
  try {
    const userPayload = createPayload(req.body);
    var userId = null;
    if (req.body._id) {
      userId = req.body._id;
    }
    const { USERS_COLLECTION } = process.env;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const updateProfile = await userCollection.findOneAndUpdate(
      userId ? { _id: ObjectId(userId) } : { email: tokenData.email },
      { $set: userPayload },
      { returnOriginal: false }
    );
    if (!updateProfile.value) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    const { password, ...rest } = updateProfile.value;
    userId ? null : generateCookie(res, rest);
    statusCode = OK;
    message = 'Success';
    data = rest;
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
      logger.error(
        setLogDetails(
          'profileMiddleware.updateProfileData',
          'Failed to update user profile Info',
          `email - ${tokenData.email}`
        )
      );
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
          'profileMiddleware.updatePassword',
          'Failed to update user password',
          `email - ${req.body.email}`
        )
      );
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
      logger.error(
        setLogDetails(
          'profileMiddleware.getProfileData',
          'Failed to fetch user Info',
          `email - ${req.body.email}`
        )
      );
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};

const getAllUsers = async (req) => {
  let data;
  let statusCode;
  let message;
  const { USERS_COLLECTION } = process.env;
  try {
    if (!req.body.filterArray || !req.body.filterArray.length > 0) {
      statusCode = 500;
      throw Error('Something went wrong');
    }
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const allUsersData = await userCollection
      .find(
        {
          role_id: { $in: req.body.filterArray },
        },
        { projection: { password: 0, token: 0, hasOnboarded: 0, role_id: 0 } }
      )
      .toArray();
    const usersCount = await userCollection
      .aggregate([{ $group: { _id: '$role_id', count: { $sum: 1 } } }])
      .toArray();
    if (!allUsersData || !allUsersData.length > 0) {
      statusCode = 401;
      throw Error('Users does not exist!');
    }
    statusCode = OK;
    message = 'Success';
    data = {
      usersData: allUsersData,
      usersCount: usersCount ? usersCount : null,
    };
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
      logger.error(
        setLogDetails(
          'profileMiddleware.getUsersInfo',
          'Unable to fetch users data',
          `Unable to fetch users data`
        )
      );
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};

const deleteUserData = async (req) => {
  let data = {};
  let statusCode;
  let message;
  const { USERS_COLLECTION } = process.env;
  try {
    var userId = req.params.userId;
    console.log(userId);
    if (!userId) {
      statusCode = 401;
      throw Error('Something went wrong');
    }
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const deleteUser = await userCollection.deleteOne({
      _id: ObjectId(userId),
    });
    if (deleteUser.deletedCount) {
      statusCode = OK;
      message = 'Success';
      data = {
        message: 'User Deleted Successfully',
      };
    } else {
      statusCode = 401;
      throw Error('Something went wrong');
    }
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
      logger.error(
        setLogDetails(
          'profileMiddleware.deleteUserData',
          'Failed to delete',
          `Failed to delete user with user id : ${userId}`
        )
      );
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};

const getUserRoles = async (req) => {
  let data;
  let statusCode;
  let message;
  try {
    const { USERS_COLLECTION } = process.env;
    const userCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
    const userRoles = await userCollection.distinct('role_id');
    if (!userRoles || !userRoles.length > 0) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    var rolesInfo = {};
    statusCode = OK;
    message = 'Success';
    userRoles.map((data) => {
      if (data === rolesData.mentee) {
        rolesInfo.mentee = data;
      } else if (data === rolesData.mentor) {
        rolesInfo.mentor = data;
      } else if (data === rolesData.admin) {
        rolesInfo.admin = data;
      }
    });
    data = rolesInfo;
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
      logger.error(
        setLogDetails(
          'profileMiddleware.getUserRoles',
          'Failed to get usersRoles',
          `Failed to get usersRoles`
        )
      );
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
  getAllUsers: async (req, res) => {
    const { statusCode, ...rest } = await getAllUsers(req, res);
    res.status(statusCode).send(rest);
  },
  deleteUserData: async (req, res) => {
    const { statusCode, ...rest } = await deleteUserData(req, res);
    res.status(statusCode).send(rest);
  },
  getUserRoles: async (req, res) => {
    const { statusCode, ...rest } = await getUserRoles(req, res);
    res.status(statusCode).send(rest);
  },
};

module.exports = profileMiddleware;
