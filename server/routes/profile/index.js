const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const profileMiddleWares = require('../../middleware/profile');
const authMiddleware = require('../../middleware/auth');

router.use(express.json());

router.post(
  '/updateProfile',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  profileMiddleWares.updateProfile
);
router.post(
  '/deleteUser',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  authMiddleware.adminAuth,
  profileMiddleWares.deleteUserData
);
router.get(
  '/getUserRoles',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  authMiddleware.adminAuth,
  profileMiddleWares.getUserRoles
);
router.post(
  '/updatePassword',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  profileMiddleWares.updatePassword
);
router.get(
  '/getProfileData',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  profileMiddleWares.getProfileData
);

router.post(
  '/getAllUsers',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  authMiddleware.adminAuth,
  profileMiddleWares.getAllUsers
);

module.exports = router;
