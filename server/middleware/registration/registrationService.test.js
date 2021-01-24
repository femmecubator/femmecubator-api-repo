const registrationService = require('./index');
const httpMocks = require('node-mocks-http');

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
      info: jest.fn(() => { }),
    };
  });
});

let request, response;
test('it should add a new user document to collection', async () => {
  request = httpMocks.createRequest({
    method: 'POST',
    url: 'api/register',
    body: {
      firstName: 'Testing',
      lastName: 'User',
      prefLoc: 'NYC',
      title: 'Software Engineer',
      email: 'test@dev.com',
      userName: 'devtest2021',
      password: "H@llo2021!",
    }
  })
  response = httpMocks.createResponse();
  await registrationService(request, response);
  const result = JSON.parse(response._getData());
  const { data: { ops: [{ _id: userId }] } } = result;
  const { data: { result: { ok: confirmation } }
  } = result
  expect(confirmation).toBe(1);
  expect(userId).toBe('test@dev.com');
})
test('it should return status code REQUEST_TIMEOUT', async () => {
  request = httpMocks.createRequest({
    method: 'POST',
    url: 'api/register',
    body: {
      firstName: '',
      lastName: '',
      prefLoc: '',
      title: '',
      email: '',
      userName: '',
      password: "",
    }
  })
  response = httpMocks.createResponse();
  await registrationService(request, response);
  expect(response._getStatusCode()).toBe(408);
})