const { login } = require('./index');
const mongoUtil = require('../../utils/mongoUtil');
const mockMongoUtil = require('../../utils/__mocks__/mockMongoClient');
const httpMocks = require('node-mocks-http');

jest.mock('cryptr', () => {
  const mockPlainText = process.env.MONGO_URL;
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

jest.mock('../../utils/authLogger', () => {
  const authLogger = {
    end: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    timeout: jest.fn(),
  };
  return authLogger;
});

jest.mock('bcryptjs', () => ({
  compare: jest.fn((sentPassword) => {
    const controlledUser = {
      email: 'sarah_d@gmail.com',
      password: 'DogBoy!',
    };
    return sentPassword === controlledUser.password ? true : false;
  }),
}));

describe('loginMiddleware', () => {
  let request, response;
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await mongoUtil.init();
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';
    await mockMongoUtil.seed(mongoUtil);
  });

  beforeEach(async () => {
    jest.resetModules();
    response = httpMocks.createResponse();
    request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/login',
    });
  });

  afterAll(async () => {
    await mockMongoUtil.drop(mongoUtil);
    mongoUtil.close();
    process.env = OLD_ENV;
  });

  test('Should Return Error for Non-existing User, Return Status 401', async () => {
    const form = {
      email: 'ali@gmail.com',
      password: 'Abcd123!',
    };
    request.body = form;

    const expectedResponse = {
      data: {},
      message: 'Wrong credentials',
    };
    await login(request, response);
    expect(response._getStatusCode()).toEqual(401);
    expect(response._getData()).toEqual(expectedResponse);
    expect(response.cookies.TOKEN).toBeUndefined();
  });

  test('Should Return Error With Invalid Credentials, Return Status 401', async () => {
    const form = {
      email: 'sarah_d@gmail.com',
      password: 'Abcd123!',
    };
    request.body = form;

    const expectedResponse = {
      data: {},
      message: 'Wrong credentials',
    };
    await login(request, response);
    expect(response._getStatusCode()).toEqual(401);
    expect(response._getData()).toEqual(expectedResponse);
    expect(response.cookies.TOKEN).toBeUndefined();
  });

  test('Should Return Cookie and Status 200', async () => {
    const controlledUser = {
      email: 'sarah_d@gmail.com',
      password: 'DogBoy!',
    };
    request.body = controlledUser;
    const expectedResponse = {
      data: {
        email: 'sarah_d@gmail.com',
        firstName: 'Sarah',
        lastName: 'Doe',
        hasOnboarded: true,
        title: 'Software Engineer',
        role_id: 0,
        bio: 'some bio',
        skills: [],
      },
      message: 'Success',
    };
    await login(request, response);
    expect(response._getData()).toEqual(expectedResponse);
    expect(response._getStatusCode()).toEqual(200);
    expect(response.cookies.TOKEN).not.toBeUndefined();
  });
});
