const status = require('http-status');
const has = require('has-keys');
const userModel = require('@models/users.js');

module.exports = {
    async getMe(req, res) {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            throw { code: status.NOT_FOUND, message: 'User not found' };
        }

        user.passwordHash = undefined;
        res.json({ status: true, message: 'Returning current user', data: user });
    },
    async getUserById(req, res) {
        if (!has(req.params, 'id'))
            throw { code: status.BAD_REQUEST, message: 'You must specify the id' };

        const user = await userModel.findById(req.params.id);
        if (!user)
            throw { code: status.NOT_FOUND, message: 'User not found' };

        user.passwordHash = undefined;
        res.json({ status: true, message: 'Returning user', data: user });
    },
    async getUsers(req, res) {
        const data = await userModel.getAll();
        res.json({ status: true, message: 'Returning users', data });
    },
    async updateUser(req, res) {
        if (!has(req.body, ['id', 'name', 'email']))
            throw { code: status.BAD_REQUEST, message: 'You must specify the id, name and email' };

        const { id, name, email } = req.body;
        if (req.user.role !== 'Admin' && req.user.id !== id)
            throw { code: status.FORBIDDEN, message: 'You can only update your own profile' };

        const updated = await userModel.updateById(id, { name, email: email.toLowerCase() });
        updated.passwordHash = undefined;
        res.json({ status: true, message: 'User updated', data: updated });
    },
    async deleteUser(req, res) {
        if (!has(req.params, 'id'))
            throw { code: status.BAD_REQUEST, message: 'You must specify the id' };

        const { id } = req.params;
        if (req.user.role !== 'Admin' && req.user.id !== id)
            throw { code: status.FORBIDDEN, message: 'You can only delete your own account' };

        await userModel.deleteById(id);
        res.json({ status: true, message: 'User deleted' });
    }
};