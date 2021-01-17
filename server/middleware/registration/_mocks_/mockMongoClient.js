const mockData = {
    CommandResult: {
        result: { n: 1, ok: 1 },
        insertedCount: 1,
    }
}

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
    insertOne({ email }) {
        return email === 'test@dev.com' ? Promise.resolve(mockData) : Promise.resolve(null);
    },
};

module.exports = { MockMongoClient };
