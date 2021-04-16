const express = require('express');
const router = express.Router();
const forgotPasswordMiddleware = require('../../middleware/forgot-password');

router.use(express.json());
router.post('/', forgotPasswordMiddleware.forgotPassword);

module.exports = router;