const express = require('express');
const router = express.Router();
const forgotPasswordMiddleware = require('../../middleware/forgot-password');

router.post('/', forgotPasswordMiddleware.forgotPassword);

module.exports = router;