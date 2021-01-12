const commonMenuMiddleware = require('./index');
const httpMocks = require('node-mocks-http');
const mockMongoUtil = require('../../utils/mongoUtil');
const loggerMock = require('simple-node-logger').createSimpleLogger();

jest.mock('../../utils/mongoUtil');

jest.mock('cryptr', () => {
  const mockPlainText =
    'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

jest.mock('simple-node-logger', () => ({
  createSimpleLogger: jest
    .fn()
    .mockReturnValue({ info: jest.fn(), error: jest.fn() }),
}));

jest.mock('mongodb');

describe('common-menu middleware', () => {
  let request;
  beforeEach(() => {
    mockMongoUtil.fetchCollection.mockImplementation(jest.fn());
    request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });
  });
  it('should return common menu API', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1000,
        },
      },
    });
    const loggerSpy = jest.spyOn(loggerMock, 'info').mockImplementationOnce();
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(loggerSpy).toHaveBeenCalled();
    expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
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
    const loggerSpy = jest.spyOn(loggerMock, 'info').mockImplementationOnce();
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(loggerSpy).toHaveBeenCalled();
    expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
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
    const loggerSpy = jest.spyOn(loggerMock, 'info').mockImplementationOnce();
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(loggerSpy).toHaveBeenCalled();
    expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
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
    const loggerSpy = jest.spyOn(loggerMock, 'info').mockImplementationOnce();
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(loggerSpy).toHaveBeenCalled();
    expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
  });
});
