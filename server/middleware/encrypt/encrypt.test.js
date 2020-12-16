const encryptMiddleware = require('./index');
const httpMocks = require('node-mocks-http');
const Cryptr = require('cryptr');
const mockCipherText = 'fakeValue';

jest.mock('cryptr', () => {
  return jest.fn().mockImplementation(() => {
    return { encrypt: () => mockCipherText };
  });
});

describe('encrypt middleware', () => {
  it('should encrypt plain text data', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/encrypt',
      body: 'test',
    });
    const response = httpMocks.createResponse();
    encryptMiddleware.encrypt(request, response);
    const cipherText = response._getData();
    expect(cipherText).toBe(mockCipherText);
  });
});
