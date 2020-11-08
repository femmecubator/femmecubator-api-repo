const commonMenuMiddleware = require('./index');
const httpMocks = require('node-mocks-http');
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

describe('common-menu middleware', () => {
  it('should return common menu API', async () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });

    const mongoClientSpy = jest.spyOn(MongoClient, 'connect');

    const response = httpMocks.createResponse({
      locals: {
        user: {
          userId: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1,
        },
      },
    });
    await commonMenuMiddleware.getMenuItems(request, response);
    expect(mongoClientSpy).toHaveBeenCalled();
  });
});
