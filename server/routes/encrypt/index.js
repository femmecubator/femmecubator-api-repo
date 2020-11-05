const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const encryptMiddleware = require('../../middleware/encrypt');

router.use(express.text());
router.post(
  '/',
  timeout(TIMEOUT, { respond: true }),
  encryptMiddleware.encrypt
);

module.exports = router;
