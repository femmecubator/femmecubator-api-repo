const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT } = require('../../utils/constants');
const skillsListMiddleware = require('../../middleware/skills-list');
const authMiddleware = require('../../middleware/auth');
router.use(express.json());

router.get(
  '/',
  timeout(TIMEOUT, { respond: true }),
 // authMiddleware.validateCookie,
 // authMiddleware.errorHandler,
  skillsListMiddleware.getSkillsItems
);


router.post(
  '/update',
  timeout(TIMEOUT, { respond: true }),
 // authMiddleware.validateCookie,
 // authMiddleware.errorHandler,
  skillsListMiddleware.updateSkillsItems
);


module.exports = router;
