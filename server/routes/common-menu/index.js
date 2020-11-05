const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const commonMenuMiddleware = require('../../middleware/common-menu');

router.get('/', timeout(TIMEOUT, { respond: true }), commonMenuMiddleware.getMenuItems)

module.exports = router;