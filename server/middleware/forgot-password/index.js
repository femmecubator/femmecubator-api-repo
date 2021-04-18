const crypto = require('crypto');
const mongoUtil = require('../../utils/mongoUtil');
const { USERS_COLLECTION } = process.env;

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
      console.log('user exists', user);
    } else {
      console.log('user does not exist', user);
    }
  } catch (error) {
    // handle errors
  }
};

const forgotPasswordMiddleware = {
  forgotPassword: async (req, res) => {
    await forgotPassword(req, res);
    res.send('forgot password');
  },
};

module.exports = forgotPasswordMiddleware;