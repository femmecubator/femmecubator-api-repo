const httpMocks = require('node-mocks-http');
const { fetchCollection } = require('./mongoUtil');
const commonMenuMiddleware = require('../middleware/common-menu');
jest.mock('mongodb');

jest.mock('cryptr', () => {
  return jest.fn().mockImplementation(() => {
    const mockPlainText =
      'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
    return { decrypt: () => mockPlainText };
  });
});

jest.mock('simple-node-logger', () => ({
  createSimpleLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
  })
}));

jest.mock('./mongoUtil');

describe('mongoUtil', () => {
  test('fetchCollection() should call MongoClient.connect()', async () => {
    fetchCollection.mockImplementationOnce(jest.fn());

    const request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });

    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1000,
        },
      },
    });

    await commonMenuMiddleware.getMenuItems(request, response);

    expect(fetchCollection).toHaveBeenCalled();
  });
});
