const { ObjectId } = require('mongodb');
const database = require('@models/database.js');
const collectionName = 'tasks';

function toObjectId(id) {
    return typeof id === 'string' ? new ObjectId(id) : id;
}

module.exports = {
    async create(task) {
        const dbo = await database.getDbo();
        task.createdAt = new Date();
        task.updatedAt = new Date();
        const result = await dbo.collection(collectionName).insertOne(task);
        return dbo.collection(collectionName).findOne({ _id: result.insertedId });
    },
    async findById(id) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).findOne({ _id: toObjectId(id) });
    },
    async findByProject(projectId) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).find({ projectId }).toArray();
    },
    async findByProjectIds(projectIds) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).find({ projectId: { $in: projectIds } }).toArray();
    },
    async findByUser(userId) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).find({ assigneeId: userId }).toArray();
    },
    async findAll() {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).find().toArray();
    },
    async updateById(id, updates) {
        const dbo = await database.getDbo();
        updates.updatedAt = new Date();
        const result = await dbo.collection(collectionName).findOneAndUpdate(
            { _id: toObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );
        return result.value;
    }
};