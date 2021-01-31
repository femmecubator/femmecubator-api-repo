const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const greetingsMiddleware = require('../../middleware/greetings');

router.get('/:name?', timeout(TIMEOUT, { respond: true }), greetingsMiddleware.sayHello);

module.exports = router;
