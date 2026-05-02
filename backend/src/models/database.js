
const { DB_URL } = process.env;
const { MongoClient } = require('mongodb');

if (!DB_URL) {
    throw new Error('Missing DB_URL environment variable');
}

const connectionString = DB_URL.trim();
let client = null;
let db = null;

module.exports = {
    /**
     * Singleton-like Database Object that connects to the mongodb database
     */
    async getDbo() {
        if (!client) {
            client = new MongoClient(connectionString, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                tls: true,
                serverSelectionTimeoutMS: 10000
            });
            await client.connect();
            db = client.db();
        }
        return db;
    }
};
