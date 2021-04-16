// const resetPasswordMiddleware = require('./index');

describe('forgot-password middleware', () => {
  describe('with valid email', () => {
    test('send reset email when user found', () => {
      // send reset single use email link
    });
    test('send email when user not found', () => {
      // send account access attempted email
    });
  });

  describe('with invalid email', () => {
    test('send status code 400', () => {
      // send status 400, invalid email pattern
    });
  });
});