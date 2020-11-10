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

var _db;

const mockMongoUtil = {
  connectToServer: async function () {
    Promise.resolve(
      (_db = {
        collection: function () {
          return collectionObj;
        },
      })
    );
  },
  getDb: function () {
    return _db;
  },
};

const collectionObj = {
  findOne({ role_id }) {
    return role_id === 1000 ? Promise.resolve(mockData) : Promise.resolve(null);
  },
};

module.exports = { mockMongoUtil };
