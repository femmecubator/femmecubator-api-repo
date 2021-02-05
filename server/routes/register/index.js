const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const JWT = require('jsonwebtoken');
const registrationMiddleware = require('../../middleware/registration');
router.use(express.json());

router.post(
  '/',
  timeout(TIMEOUT, { respond: true }),
  registrationMiddleware.register
);
module.exports = router;
