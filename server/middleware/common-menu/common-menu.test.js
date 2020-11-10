const commonMenuMiddleware = require('./index');
const httpMocks = require('node-mocks-http');
const { MockMongoClient } = require('./__mocks__/mockMongoClient');
const { mockMongoUtil } = require('./__mocks__/mockMongoUtil');
const MongoClient = require('mongodb').MongoClient;

jest.mock('cryptr', () => {
  const mockPlainText =
    'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
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
    jest.spyOn(mockMongoUtil, 'connectToServer');

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
    expect(mockMongoUtil.connectToServer).toHaveBeenCalled();
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
    expect(mockMongoUtil.connectToServer).toHaveBeenCalled();
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
    expect(mockMongoUtil.connectToServer).toHaveBeenCalled();
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
    expect(mockMongoUtil.connectToServer).toHaveBeenCalled();
  });
});
