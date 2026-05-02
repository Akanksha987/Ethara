const { ObjectId } = require('mongodb');
const database = require('@models/database.js');
const collectionName = 'projects';

function toObjectId(id) {
    return typeof id === 'string' ? new ObjectId(id) : id;
}

module.exports = {
    async create(project) {
        const dbo = await database.getDbo();
        project.createdAt = new Date();
        project.members = project.members || [];
        const result = await dbo.collection(collectionName).insertOne(project);
        return dbo.collection(collectionName).findOne({ _id: result.insertedId });
    },
    async findById(id) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).findOne({ _id: toObjectId(id) });
    },
    async findByUser(userId) {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName)
            .find({
                $or: [
                    { ownerId: userId },
                    { members: userId }
                ]
            })
            .toArray();
    },
    async findAll() {
        const dbo = await database.getDbo();
        return dbo.collection(collectionName).find().toArray();
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
    async addMember(projectId, memberId) {
        const dbo = await database.getDbo();
        const result = await dbo.collection(collectionName).findOneAndUpdate(
            { _id: toObjectId(projectId) },
            { $addToSet: { members: memberId } },
            { returnDocument: 'after' }
        );
        return result.value;
    },
    async removeMember(projectId, memberId) {
        const dbo = await database.getDbo();
        const result = await dbo.collection(collectionName).findOneAndUpdate(
            { _id: toObjectId(projectId) },
            { $pull: { members: memberId } },
            { returnDocument: 'after' }
        );
        return result.value;
    }
};