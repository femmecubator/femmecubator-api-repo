const { EXPECTATION_FAILED } = require('http-status-codes');
const defaultTimeout = '90000';
const overriddenTimeout = '50000';
const defaultPort = '3001';
const overriddenPort = '80';
describe('constants', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });
  it('should return default value for timeout and port when not overridden', () => {
    const { TIMEOUT, PORT } = require('../utils/constants');
    expect(TIMEOUT).toStrictEqual(parseInt(defaultTimeout));
    expect(PORT).toStrictEqual(parseInt(defaultPort));
  });
  it('should override default for timeout', () => {
    process.env = { ...OLD_ENV };
    process.env.TIMEOUT = '50000';
    process.env.PORT = '80';
    const { TIMEOUT, PORT } = require('../utils/constants');
    expect(TIMEOUT).toStrictEqual(parseInt(overriddenTimeout));
    expect(PORT).toStrictEqual(parseInt(overriddenPort));
  });
});
