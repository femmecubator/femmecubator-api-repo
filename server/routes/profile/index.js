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

module.exports = router;
