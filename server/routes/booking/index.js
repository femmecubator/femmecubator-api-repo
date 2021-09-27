const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const bookingMiddleWares = require('../../middleware/booking');
const authMiddleware = require('../../middleware/auth');

router.use(express.json());

router.post(
  '/getTimeSlots',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  bookingMiddleWares.getMentorTimeSlots
);

module.exports = router;
