const registrationService = require('./index');
const httpMocks = require('node-mocks-http');
const mockMongoUtil = require('../../utils/mongoUtil');

jest.mock('../../utils/mongoUtil');
let collectionObj = mockMongoUtil.fetchCollection.mockImplementationOnce(jest.fn());
collectionObj.insertOne = jest.fn();
const errorMessage = {
  data: 'There was a problem with your request. Please try again later.'
}

jest.mock('cryptr', () => {
  const mockPlainText =
    'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

let request, response;
describe('Registration API', () => {
  beforeEach(() => {
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
    });
  });

  it('should add a new user document to collection ', async () => {
    response = httpMocks.createResponse();
    request.body.collectionObj = collectionObj;
    await registrationService(request, response)
    expect(collectionObj.insertOne).toHaveBeenCalled();
  });

  it('should return statusCode BAD_REQUEST whe user creation fails', async () => {
    response = httpMocks.createResponse();
    request.body.collectionObj = true;
    await registrationService(request, response);
    expect(response.statusCode).toBe(400)
  });

  it('should return proper error message when user creation fails', async () => {
    response = httpMocks.createResponse();
    request.body.collectionObj = collectionObj;
    await registrationService(request, response)
    expect(response._getJSONData()).toStrictEqual(errorMessage);
  });

  it('should return statusCode GATEWAY_TIMEOUT when db connection fails', async () => {
    response = httpMocks.createResponse();
    await registrationService(request, response);
    expect(response.statusCode).toBe(504)
  });
});
