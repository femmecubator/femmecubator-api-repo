const mockData = {
  role_id: 1,
  headers: [
    {
      id: 1,
      label: 'Listings',
      href: '/listings',
    },
    {
      id: 2,
      label: 'Mentors',
      href: '/mentors',
    },
    {
      id: 3,
      label: 'My Account',
      href: '/account',
    },
    {
      id: 4,
      label: 'Log Out',
      href: '/logout',
    },
  ],
};

const CommandResultSuccess = {
  result: { n: 1, ok: 1 },
  ops: [{
    firstName: 'Testing',
    lastName: 'User',
    prefLoc: 'NYC',
    title: 'Software Engineer',
    _id: 'test@dev.com',
    userName: 'devtest2021',
    password: "H@llo2021!",
  }]
};
const CommandResultFail = {
  result: { n: 0, ok: 0 },
  ops: [{}]
};
const MockMongoClient = {
  connect: async function (_uri, _options) {
    const client = {
      db: mockDb,
      close: () => { },
    };
    return Promise.resolve(client);
  },
};

const mockDb = () => {
  return {
    collection() {
      return mockCollection;
    },
  };
};

const mockCollection = {
  findOne({ role_id }) {
    return role_id === 1000 ? Promise.resolve(mockData) : Promise.resolve(null);
  },
  insertOne({ email }) {
    if (email.length > 0) {
      return CommandResultSuccess;
    } else {
      CommandResultFail;
    }
  }
};

module.exports = { MockMongoClient };
