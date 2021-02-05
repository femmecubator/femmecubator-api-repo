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

describe('registrationMiddleware', () => {
  const OLD_ENV = process.env;
  let client;

  beforeAll(async () => {
    client = await mongoUtil.connect();
  });
  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    await mockMongoUtil.drop(client);
  });
  afterEach(async () => await mockMongoUtil.drop(client));
  afterAll(() => {
    mongoUtil.close();
    process.env = OLD_ENV;
  });

  test('should add new user, return cookie and status 200 ', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';

    const data = {
      role_id: 0,
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
    expect(response.cookie).not.toBeNull();
    expect(userCount).toEqual(1);
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

  test('should return status 504', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';
    process.env.TEST_TIMEOUT = true;

    const request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
      body: {},
    });
    const response = httpMocks.createResponse();
    const expectedResp = {
      data: {},
      message: 'Gateway timeout',
    };
    await register(request, response);

    expect(response._getStatusCode()).toBe(504);
    expect(response._getData()).toEqual(expectedResp);
  });
});