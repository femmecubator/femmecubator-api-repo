const express = require('express');
// const timeout = require('connect-timeout');
const router = express.Router();
const { HttpStatusCodes } = require('../../utils/constants');
// const JWT = require('jsonwebtoken');
// const { uuid } = require('uuidv4');

router.use(express.json());

router.post('/', (req, res) => {

  const { email } = req.body;
  
  if (email.toLowerCase() != "test1@femmecubator.com") {
    res
    .status(HttpStatusCodes.StatusCodes.NOT_FOUND)
    .send({ err: { message: "Email not found." } });
  } else {
    res
      .status(HttpStatusCodes.StatusCodes.OK)
      .end();
  }

});

module.exports = router;