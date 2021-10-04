const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const bookingMiddleWares = require('../../middleware/booking');
const authMiddleware = require('../../middleware/auth');

router.use(express.json());

router.get(
  '/',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  bookingMiddleWares.getMentorsBookings
);
router.post(
  '/getTimeSlots',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  bookingMiddleWares.getMentorTimeSlots
);
router.post(
  '/createCalendarEvent',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  bookingMiddleWares.createCalendarEvent
);

module.exports = router;
