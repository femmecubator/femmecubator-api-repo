const { register } = require('./index');
const mongoUtil = require('../../utils/mongoUtil');
const mockMongoUtil = require('../../utils/__mocks__/mockMongoClient');
const httpMocks = require('node-mocks-http');

jest.mock('cryptr', () => {
  const mockPlainText = process.env.MONGO_URL;
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

jest.mock('./registrationLogger', () => {
  const registrationLogger = {
    end: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    timeout: jest.fn(),
  }
  return registrationLogger;
});

describe('registrationMiddleware', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterEach(async () => await mockMongoUtil.drop(mongoUtil));
  afterAll(() => {
    mongoUtil.close();
    process.env = OLD_ENV;
  });

  test('should add new user, return cookie and status 200 ', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';

    const data = {
      role_id: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "JANe_d@gmail.com",
      title: "UX Designer",
    }
    const request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
      body: {
        ...data,
        password: "H@llo2021!",
      }
    });
    const response = httpMocks.createResponse();
    const expectedResp = {
      data: { ...data, email: data.email.toLowerCase() },
      message: 'Success',
    };
    await register(request, response);
    const collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
    const userCount = await collectionObj.find({}).count();

    expect(response._getStatusCode()).toEqual(200);
    expect(response._getData()).toEqual(expectedResp);
    expect(response.cookies.TOKEN).not.toBeUndefined();
    expect(userCount).toEqual(1);
  });

  test('should not add new user and return status 409 if email in use ', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';
    await mockMongoUtil.seed(mongoUtil);

    const data = {
      role_id: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "JANe_d@gmail.com",
      title: "UX Designer",
    }
    const request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
      body: {
        ...data,
        password: "H@llo2021!",
      }
    });
    const response = httpMocks.createResponse();
    const expectedResp = {
      data: {},
      message: 'Email already in use',
    };
    await register(request, response);

    expect(response._getStatusCode()).toEqual(409);
    expect(response._getData()).toEqual(expectedResp);
    expect(response.cookies.TOKEN).toBeUndefined();
  });

  test('should return status 400 with empty form fields', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';

    const request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
      body: {
        role_id: '',
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        password: '',
      }
    });
    const response = httpMocks.createResponse();
    const expectedResp = {
      data: {},
      message: 'Bad request'
    };
    await register(request, response);
    const collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
    const userCount = await collectionObj.find({}).count();

    expect(response._getStatusCode()).toBe(400);
    expect(response._getData()).toEqual(expectedResp);
    expect(response.cookies).toStrictEqual({});
    expect(userCount).toEqual(0);
  });

  test('should return status 400 with invalid form fields', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';

    const request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
      body: {
        role_id: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "JANe_dgmail.com",
        title: "UX Designer",
        password: "H@llo2021!",
      }
    });
    const response = httpMocks.createResponse();
    const expectedResp = {
      data: {},
      message: 'Bad request'
    };
    await register(request, response);
    const collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
    const userCount = await collectionObj.find({}).count();

    expect(response._getStatusCode()).toBe(400);
    expect(response._getData()).toEqual(expectedResp);
    expect(response.cookies).toStrictEqual({});
    expect(userCount).toEqual(0);
  });

  test('should return status 504', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';
    process.env.TEST_TIMEOUT = true;

    const request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
      body: {
        role_id: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "JANe_d@gmail.com",
        title: "UX Designer",
        password: "H@llo2021!",
      },
    });
    const response = httpMocks.createResponse();
    const expectedResp = 'Gateway Timeout';
    await register(request, response);

    expect(response._getStatusCode()).toBe(504);
    expect(response._getData().message).toEqual(expectedResp);
  });
});