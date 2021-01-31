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
      firstName: 'Testing',
      lastName: 'User',
      title: 'Software Engineer',
      email: 'test@dev.com',
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
      data: { ...data },
      message: 'Success',
    }
    await register(request, response);
    const collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
    const userCount = await collectionObj.find({}).count();

    expect(response._getStatusCode()).toEqual(200);
    expect(response._getData()).toEqual(expectedResp);
    expect(response.cookie).not.toBeNull();
    expect(userCount).toEqual(1);
  });

  // test('it should return status code REQUEST_TIMEOUT', async () => {
  //   request = httpMocks.createRequest({
  //     method: 'POST',
  //     url: 'api/register',
  //     body: {
  //       firstName: '',
  //       lastName: '',
  //       title: '',
  //       email: '',
  //       password: '',
  //     }
  //   })
  //   response = httpMocks.createResponse();
  //   await register(request, response);
  //   expect(response._getStatusCode()).toBe(408);
  // })
});