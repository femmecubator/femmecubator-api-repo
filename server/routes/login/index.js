const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const loginMiddleware = require('../../middleware/login');

router.use(express.json());

router.post('/', timeout(TIMEOUT, { respond: true }), loginMiddleware.login);

module.exports = router;
