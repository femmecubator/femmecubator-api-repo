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
  };
  return registrationLogger;
});

describe('registrationMiddleware', () => {
  let request, response;
  const OLD_ENV = process.env;
  const form = {
    role_id: 1,
    firstName: "Jane",
    lastName: "Doe",
    email: "JANe_d@gmail.com",
    title: "UX Designer",
    password: "H@llo2021!",
  };

  beforeAll(async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';
  });
  beforeEach(async () => {
    jest.resetModules();
    response = httpMocks.createResponse();
    request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
    });
  });
  afterEach(async () => {
    await mockMongoUtil.drop(mongoUtil);
  });
  afterAll(() => {
    mongoUtil.close();
    process.env = OLD_ENV;
  });

  test('should add new user, return cookie and status 200 ', async () => {
    const { role_id, firstName, lastName, email, title } = form;
    request.body = form;

    const expectedResp = {
      data: { role_id, firstName, lastName, email: email.toLowerCase(), title },
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
    request.body = form;
    
    const expectedResp = {
      data: {},
      message: 'Email already in use',
    };
    await mockMongoUtil.seed(mongoUtil);
    await register(request, response);

    expect(response._getStatusCode()).toEqual(409);
    expect(response._getData()).toEqual(expectedResp);
    expect(response.cookies.TOKEN).toBeUndefined();
  });

  test('should return status 400 with empty form fields', async () => {
    request.body = {
      role_id: '',
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      password: '',
    };
    
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
    request.body = {...form, email: "JANe_dgmail.com"};
    
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
    process.env.TEST_TIMEOUT = true;
    request.body = form;
    
    const expectedResp = 'Gateway Timeout';
    await register(request, response);

    expect(response._getStatusCode()).toBe(504);
    expect(response._getData().message).toEqual(expectedResp);
  });
});