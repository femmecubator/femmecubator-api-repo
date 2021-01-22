const mongoUtil = require('../../utils/mongoUtil');
const mockMongoUtil = require('../../utils/__mocks__/mockMongoClient');
const httpMocks = require('node-mocks-http');
const mentorMiddleware = require('.');
const { users } = require('../../utils/__mocks__/mockData');

jest.mock('cryptr', () => {
  const mockPlainText = process.env.MONGO_URL;
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

describe('mentor middleware', () => {
  const OLD_ENV = process.env;
  let req;

  beforeAll(async () => {
    const client = await mongoUtil.connect();
    await mockMongoUtil.seed(client);
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/mentors',
    });
  });

  afterAll(async () => {
    await mongoUtil.close();
    process.env = OLD_ENV;
  });

  describe('when user is logged in', () => {
    process.env.USERS_COLLECTION = 'users';

    const res = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1,
          title: 'Software Engineer'
        },
      },
    });

    it('should return all mentors', async () => {
      const mentors = users.filter(user => user.role_id === 1);
      
      const expectedResp = mentors.map(mentor => ({
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        title: mentor.title,
        bio: mentor.bio,
        skills: mentor.skills,
      }))
      
      await mentorMiddleware.getMentors(req, res);
      expect(res._getData()).toEqual(expectedResp);
    });
  });

})