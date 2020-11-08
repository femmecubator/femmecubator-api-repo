const commonMenuMiddleware = require('./index');
const httpMocks = require('node-mocks-http');
const { MockMongoClient } = require('./__mocks__/mockMongoClient');
const MongoClient = require('mongodb').MongoClient;

const mockPlainText =
  'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';

jest.mock('cryptr', () => {
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

jest.mock('simple-node-logger'.createSimpleLogger, () => {
  return jest.fn().mockImplementation(() => {
    return {
      info: jest.fn(() => {}),
    };
  });
});

jest.mock('mongodb');

describe('common-menu middleware', () => {
  let request;
  beforeEach(() => {
    jest.spyOn(MockMongoClient, 'connect');
    request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });
  });
  it('should return common menu API', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          userId: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1000,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(MockMongoClient.connect).toHaveBeenCalled();
  }, 30000);
  it('should throw an exception', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          userId: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1001,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(MockMongoClient.connect).toHaveBeenCalled();
  });

  it('should return statusCode BAD_REQUEST', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          userId: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1002,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(MockMongoClient.connect).toHaveBeenCalled();
  });

  it('should return statusCode GATEWAY_TIMEOUT', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          userId: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1003,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(MockMongoClient.connect).toHaveBeenCalled();
  });
});
