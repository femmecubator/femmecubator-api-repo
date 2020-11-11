const {
  MockMongoClient,
} = require('../middleware/common-menu/__mocks__/mockMongoClient');
const { fetchCollection } = require('./mongoUtil');

jest.mock('mongodb');

jest.mock('cryptr', () => {
  return jest.fn().mockImplementation(() => {
    const mockPlainText =
      'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
    return { decrypt: () => mockPlainText };
  });
});

describe('mongoUtil', () => {
  test('fetchCollection() should call MongoClient.connect()', async () => {
    jest.spyOn(MockMongoClient, 'connect');

    await fetchCollection('common-menu');

    expect(MockMongoClient.connect).toHaveBeenCalled();
  });
});
