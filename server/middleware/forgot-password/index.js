const mongoUtil = require('../../utils/mongoUtil');
const { USERS_COLLECTION } = process.env;

const findUserByEmail = async ({ body: { email } }) => {
  const usersCollection = await mongoUtil.fetchCollection(USERS_COLLECTION);
  const user = await usersCollection.findOne({ email: email });
  return user;
};

const forgotPassword = async (req, res) => {
  try {
    const user = await findUserByEmail(req);
    if (user) {
      console.log('user exists', user);
    } else {
      console.log('user does not exist', user);
    }
  } catch (error) {
    // handle errors
  }
}

const forgotPasswordMiddleware = {
  forgotPassword: async (req, res) => {
    await forgotPassword(req, res);
    res.send('forgot password');
  },
};

module.exports = forgotPasswordMiddleware;