
const { ObjectId } = require('mongodb');
const database = require('@models/database.js');
const collectionName = 'users';

function toObjectId(id) {
    return typeof id === 'string' ? new ObjectId(id) : id;
}

module.exports = {
    async count() {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).countDocuments();
    },
    async getAll() {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).find().project({ passwordHash: 0 }).toArray();
    },
    async findById(id) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).findOne({ _id: toObjectId(id) });
    },
    async findByEmail(email) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).findOne({ email: email.toLowerCase() });
    },
    async create(user) {
        const dbo = await database.getDbo();
        delete user._id;
        delete user.id;
        const result = await dbo.collection(collectionName).insertOne(user);
        return dbo.collection(collectionName).findOne({ _id: result.insertedId });
    },
    async updateById(id, updates) {
        const dbo = await database.getDbo();
        const result = await dbo.collection(collectionName).findOneAndUpdate(
            { _id: toObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        return result.value;
    },
    async deleteById(id) {
        const dbo = await database.getDbo();
        await dbo.collection(collectionName).deleteOne({ _id: toObjectId(id) });
    }
};