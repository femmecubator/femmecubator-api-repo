const mongo = require('./__mocks__/mockMongoClient');
 
describe('testing', () => {
  const mockMongoClient = new mongo;

  beforeAll(async () => {
    await mockMongoClient.startAndPopulateDB();
  });
  afterAll(() => mockMongoClient.stop());

    it('should insert a doc into collection', async () => {
    const users = mockMongoClient.db.collection('users');
   
    const mockUser = {_id: '123', name: 'Billy'};
    await users.insertOne(mockUser);
   
    const insertedUser = await users.findOne({_id: '123'});
    console.log(await users.find().toArray())
    expect(insertedUser).toEqual(mockUser);
  });
});

// describe('insert', () => {
//   let connection = mockMongoUtil.createMemoryServer();
//   console.log(connection);
//   // let db;
 
//   beforeEach(() => {

//   })
//   // beforeAll(async () => {
//   //   db = await connection.db();
//   // });
 
//   afterAll(async () => {
//     await connection.close();
//   });

//   it('should insert a doc into collection', async () => {
//     // const users = db.collection('users');
//     const users = 'hello'
   
//     const mockUser = {_id: 'some-user-id', name: 'John'};
//     // await users.insertOne(mockUser);
   
//     // const insertedUser = await users.findOne({_id: 'some-user-id'});
//     // expect(insertedUser).toEqual(mockUser);
//     expect('hello').toEqual('hello')
//   });
// });