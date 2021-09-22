const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const mentorMiddleware = require('../../middleware/mentor');
const authMiddleware = require('../../middleware/auth');

router.get(
  '/',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  mentorMiddleware.getMentors
);
router.get(
  '/profile',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  mentorMiddleware.getMentorsProfile
);
router.post(
  '/updateProfile',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  mentorMiddleware.updateMentor
);

module.exports = router;
