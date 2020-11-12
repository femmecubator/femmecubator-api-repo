const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const commonMenuMiddleware = require('../../middleware/common-menu');
const authMiddleware = require('../../middleware/auth');

router.get(
  '/',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  commonMenuMiddleware.getMenuItems
);

module.exports = router;
