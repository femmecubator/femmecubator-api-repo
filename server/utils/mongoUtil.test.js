const { connectToServer, getDb } = require('./mongoUtil');

jest.mock('mongodb');

jest.mock('cryptr', () => {
  return jest.fn().mockImplementation(() => {
    const mockPlainText =
      'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
    return { decrypt: () => mockPlainText };
  });
});

let _db;

describe('mongoUtil', () => {
  test('connectToServer() should call mongoDB connect()', async () => {
    const mongoClient = {
      connect: jest.fn(() => true),
    };

    await connectToServer(mongoClient);
    expect(mongoClient.connect).toHaveBeenCalled();
  });

  test('getDb() should return _db', () => {
    let result = getDb();
    expect(result).toBe(_db);
  });
});
