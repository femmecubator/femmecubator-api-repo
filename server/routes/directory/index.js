const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const authMiddleware = require('../../middleware/auth');
const directoryMiddleware = require('../../middleware/directory');


router.get(
  '/',
  timeout(TIMEOUT, { respond: true }),
  authMiddleware.validateCookie,
  authMiddleware.errorHandler,
  directoryMiddleware.fetchDirectory
);

module.exports = router;
