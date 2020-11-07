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

describe('common-menu middleware', () => {
  it('should return common menu API', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });

    const mongoClientSpy = jest.spyOn(MongoClient, 'connect');

    const response = httpMocks.createResponse();
    commonMenuMiddleware.getMenuItems(request, response);
    expect(mongoClientSpy).toHaveBeenCalled();
  });
});
