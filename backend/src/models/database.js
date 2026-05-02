
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
        if (!client || !db) {
            client = new MongoClient(connectionString, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                tls: true,
                serverSelectionTimeoutMS: 10000
            });
            try {
                await client.connect();
                db = client.db();
                if (!db) {
                    throw new Error('Unable to resolve database from DB_URL');
                }
            } catch (error) {
                client = null;
                db = null;
                throw error;
            }
        }
        return db;
    }
};
