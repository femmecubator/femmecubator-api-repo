const registrationService = require('./index');
const httpMocks = require('node-mocks-http');
const mockMongoUtil = require('../../utils/mongoUtil');
const mockDB = require('./mock');
jest.mock('../../utils/mongoUtil');

const collectionObj = mockMongoUtil.fetchCollection.mockImplementationOnce(jest.fn());
mockMongoUtil.fetchCollection = jest.fn().mockResolvedValue({
  data: [
    {
      userId: 1,
      id: 1,
      title: 'test'
    }
  ]
});

const errorMessage = {
  data: 'There was a problem with your request. Please try again later.'
}

jest.mock(collectionObj, () => {
  const mockResponse = { n: 1, ok: 1 };
  return jest.fn().mockImplementation(() => {
    return { insertOne: (payload) => mockResponse }
  })
})
jest.mock('cryptr', () => {
  const mockPlainText =
    'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

let request, response;
jest.mock('mongodb');
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

  // it('should add a new user document to collection ', async () => {
  //   response = httpMocks.createResponse();
  //   await registrationService(request, response)
  //   expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
  // });

  // it('should return statusCode GATEWAY_TIMEOUT when db connection fails', async () => {
  //   response = httpMocks.createResponse();
  //   await registrationService(request, response);
  //   expect(response.statusCode).toBe(504)
  // });



  it('succesfully adds new user and returs confirmation', async () => {
    response = httpMocks.createResponse();
    let a = await registrationService(request, response)
    expect(mockMongoUtil.fetchCollection).toHaveBeenCalledTimes(1);
    // let b = mockMongoUtil.fetchCollection()
    // b.resolve().then(() => console.log);
  })
})
  // expect.assertions(1)
  // await expect(registrationService(request, response)).resolves.toEqual('CommandResult')
  // await expect(user.getUserName(5)).resolves.toEqual('Paul')

  // const data = await registrationService(request, response);
  // expect(data.result).toEqual({ n: 1, ok: 1 });
  // it('should return statusCode BAD_REQUEST whe user creation fails', async () => {
  // response = httpMocks.createResponse();
  //   console.log(response, '#####');
  // expect(response.statusCode).toBe(400)


  // it('should return proper error message when user creation fails', async () => {
  //   response = httpMocks.createResponse();
  //   request.body.collectionObj = collectionObj;
  //   await registrationService(request, response)
  //   expect(response._getJSONData()).toStrictEqual(errorMessage);
  // });


