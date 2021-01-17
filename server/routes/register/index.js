const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT, HttpStatusCodes } = require('../../utils/constants');
const JWT = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const registrationService = require('../../middleware/registration')
router.use(express.json());

router.post(
  '/',
  timeout(TIMEOUT, { respond: true }),
  registrationService
);
module.exports = router;
