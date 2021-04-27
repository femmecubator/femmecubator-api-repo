const crypto = require('crypto');
const mongoUtil = require('../../utils/mongoUtil');
const nodeMailerUtil = require('../../utils/nodemailerUtil');
const { USERS_COLLECTION, REACT_APP_BASE_URL } = process.env;

const findUserAndSetResetToken = async ({ body: { email } }, resetPasswordToken, resetPasswordDate) => {
  const query = { email: email };
  const update = {
    $set: {
      resetPasswordToken: resetPasswordToken,
      resetPasswordDate: resetPasswordDate,
    }
  };
  const options = { returnOriginal: false };

  const usersCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
  const { value } = await usersCollection.findOneAndUpdate(query, update, options);
  return value;
};

const generateRandomToken = () => {
  const buf = crypto.randomBytes(20);
  const token = buf.toString('hex');
  return token;
};

const forgotPassword = async (req, res) => {
  try {
    const resetPasswordToken = generateRandomToken();
    const resetPasswordDate = Date.now() + 3600000;

    const user = await findUserAndSetResetToken(req, resetPasswordToken, resetPasswordDate);

    if (user) {
      const resetLink = `${REACT_APP_BASE_URL}/reset?token=${resetPasswordToken}`;
      nodeMailerUtil.sendMail('FORGOT_PASSWORD_VALID', req.body.email, {resetLink: resetLink});
      console.log('user exists', user);
      console.log('link', resetLink);
      return resetLink;
    } else {
      nodeMailerUtil.sendMail('FORGOT_PASSWORD_INVALID', req.body.email);
      console.log('user does not exist');
    }
  } catch (error) {
    // handle errors
  }
};

const forgotPasswordMiddleware = {
  forgotPassword: async (req, res) => {
    const data = await forgotPassword(req, res);
    res.send(data);
  },
  resetPassword: async (req, res) => {

  },
};

module.exports = forgotPasswordMiddleware;