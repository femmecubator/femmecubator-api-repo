const commonMenuMiddleware = require('./index');
const httpMocks = require('node-mocks-http');
const mongoUtil = require('../../utils/mongoUtil');
const mockMongoUtil = require('../../utils/__mocks__/mockMongoClient');

jest.mock('cryptr', () => {
  const mockPlainText = process.env.MONGO_URL;
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

jest.mock('simple-node-logger', () => ({
  createSimpleLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
  })
}));

describe('common-menu middleware', () => {
  const OLD_ENV = process.env;
  let client;
  let request;

  beforeAll(async () => {
    client = await mongoUtil.connect();
  });
  beforeEach(async () => {
    jest.resetModules();
    process.env = OLD_ENV;
    process.env.COMMON_MENU_COLLECTION = 'common-menu';

    request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });
    await mockMongoUtil.seed(client);
  });
  afterEach(async () => {
    await mockMongoUtil.drop(client)
  });
  afterAll(async () => {
    mongoUtil.close();
    process.env = OLD_ENV;
  });
  it('should return common menu API', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          title: 'Software Engineer',
          userName: 'Jane D.',
          role_id: 1,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(response._getStatusCode()).toBe(200);
  }, 30000);
  it('should throw an exception', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1001,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(response._getStatusCode()).toBe(404);
  });

  it('should return statusCode BAD_REQUEST', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1002,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(response._getStatusCode()).toBe(400);
  });

  it('should return statusCode GATEWAY_TIMEOUT', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1003,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(response._getStatusCode()).toBe(504);
  });
});
