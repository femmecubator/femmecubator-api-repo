const httpMocks = require('node-mocks-http');
const loggerMock = require('simple-node-logger').createSimpleLogger();
const authMiddleware = require('./index');

jest.mock('simple-node-logger', () => ({
  createSimpleLogger: jest.fn().mockReturnValue({ info: jest.fn() }),
}));

describe('Auth Middleware', () => {
  it('should validate cookie', async () => {
    const next = jest.fn();
    const loggerSpy = jest.spyOn(loggerMock, 'info');
    const request = httpMocks.createRequest({
      method: 'get',
      cookies: 'TOKEN=fakeToken;SESSIONID=fakeSessionId',
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

    await authMiddleware.validateCookie(request, response, next);
    await expect(loggerSpy).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
