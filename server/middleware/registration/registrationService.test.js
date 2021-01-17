const registrationService = require('./index');
const httpMocks = require('node-mocks-http');
const mockMongoUtil = require('../../utils/mongoUtil');

jest.mock('../../utils/mongoUtil');

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

jest.mock('mongodb');

describe('Registration API', () => {
  beforeEach(() => {
    mockMongoUtil.fetchCollection.mockImplementationOnce(jest.fn());
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
    const response = httpMocks.createResponse({
        data: {
          CommandResult: {
            result: { n: 1, ok: 1 },
            insertedCount: 1,
          },
      },
    });
    await registrationService(request, response);
    expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
  }, 30000);

  it('should throw an exception', async () => {
    const response = httpMocks.createResponse({
      locals: {


      },
    });
    await registrationService(request, response);
    expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
  });

  // it('should return statusCode BAD_REQUEST', async () => {
  //   const response = httpMocks.createResponse({
  //     locals: {
  //       user: {
  //         email: 'jane_d@gmail.com',
  //         userName: 'Jane D.',
  //         role_id: 1002,
  //       },
  //     },
  //   });
  //   await commonMenuMiddleware.getMenuItems(request, response);
  //   expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
  // });

  // it('should return statusCode GATEWAY_TIMEOUT', async () => {
  //   const response = httpMocks.createResponse({
  //     locals: {
  //       user: {
  //         email: 'jane_d@gmail.com',
  //         userName: 'Jane D.',
  //         role_id: 1003,
  //       },
  //     },
  //   });
  //   await commonMenuMiddleware.getMenuItems(request, response);
  //   expect(mockMongoUtil.fetchCollection).toHaveBeenCalled();
  // });
})
// const registrationService = require("./index");

// const testUser = {
//     firstName: 'Testing',
//     lastName: 'User',
//     prefLoc: 'NYC',
//     title: 'Software Engineer',
//     email: 'Testing@femmcubator.com',
//     userName: 'devtest2021',
//     password: "H@llo2021!",
// }

// );


// describe("Add new document to user collection", () => {

//     test("it can add a new user to the database", async () => {
//         const actual = await registrationService(testUser)
//         expect(actual.success).toBeTruthy()
//         expect(actual.error).toBeUndefined()

//         // we should be able to get the user
//         const user = await registrationService(testUser.email)
//         // for comparison, we delete the _id key returned from Mongo
//         delete user._id
//         expect(user).toEqual(testUser)
//     })

//     test("it returns an error when trying to register duplicate user", async () => {
//         const expected = "A user with the given email already exists."
//         const actual = await registrationService(testUser)
//         expect(actual.error).toBe(expected)
//         expect(actual.success).toBeFalsy()
//     })
// })
