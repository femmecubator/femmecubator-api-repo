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

// const _db = {
//   collection: function () {
//     return collectionObj;
//   },
// };

// const mongoClient = {
//   connect: function () {
//     return (err, client) => {
//       return true;
//     };
//   },
// };

const mockMongoUtil = {
  fetchCollection: function () {
    return collectionObj;
  },

  // connectToServer: function () {
  //   return mongoClient.connect();
  // },
  // getDb: function () {
  //   return _db;
  // },
};

const collectionObj = {
  findOne({ role_id }) {
    return role_id === 1000 ? Promise.resolve(mockData) : Promise.resolve(null);
  },
};

module.exports = mockMongoUtil;
