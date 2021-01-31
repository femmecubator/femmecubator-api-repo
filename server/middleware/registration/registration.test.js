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
  let request;

  beforeAll(async () => {
    client = await mongoUtil.connect();
  });
  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    await mockMongoUtil.seed(client);
  });
  afterEach(async () => await mockMongoUtil.drop(client));
  afterAll(() => {
    mongoUtil.close();
    process.env = OLD_ENV;
  });

  test('it should add a new user document to collection', async () => {
    process.env.USERS_COLLECTION = 'users';
    process.env.SECRET_KEY = 'ABC123';
    request = httpMocks.createRequest({
      method: 'POST',
      url: 'api/register',
      body: {
        firstName: 'Testing',
        lastName: 'User',
        title: 'Software Engineer',
        email: 'test@dev.com',
        password: "H@llo2021!",
      }
    })
    response = httpMocks.createResponse();
    await register(request, response);
    console.log(response._getData())
    // const result = JSON.parse(response._getData());
    // console.log(result)
    // const { data: { ops: [{ _id: userId }] } } = result;
    // const { data: { result: { ok: confirmation } }
    // } = result
    // expect(confirmation).toBe(1);
    // expect(userId).toBe('test@dev.com');
  })
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
    // await register(request, response);
    // expect(response._getStatusCode()).toBe(408);
  // })
});