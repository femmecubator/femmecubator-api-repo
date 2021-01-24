const mockData = [];

const MockMongoClient = {
    connect: async function (_uri) {
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
    insertOne(payLoad) {
        mockData.push(payLoad)
        return payLoad !== null ? Promise.resolve(mockData) : Promise.resolve(null);
    },
};

module.exports = { MockMongoClient };
