/*const {
  MockMongoClient,
} = require('../middleware/common-menu/__mocks__/mockMongoClient');*/
// const { fetchCollection } = require('./mongoUtil');

// const { fetchCollection } = require('./__mocks__/mockMongoUtil');
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
/*
jest.mock('./mongoUtil', () => {
  return jest.fn().mockImplementation(() => {
    return {
      fetchCollection: () => {
        findOne: ({ role_id }) => {
          return role_id === 1000
            ? Promise.resolve(mockData)
            : Promise.resolve(null);
        };
      },
    };
  });
});*/

jest.mock('./mongoUtil');

describe('mongoUtil', () => {
  test('fetchCollection() should call MongoClient.connect()', async () => {
    fetchCollection.mockImplementationOnce(jest.fn());
    // jest.spyOn(mockMongoUtil, 'fetchCollection');

    const request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });

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

    // await fetchCollection('common-menu');

    expect(fetchCollection).toHaveBeenCalled();
  });
});
