const bcrypt = require('bcryptjs');
const status = require('http-status');
const has = require('has-keys');
const userModel = require('@models/users.js');
const { signToken } = require('@util/auth.js');

module.exports = {
    async signup(req, res) {
        if (!has(req.body, ['name', 'email', 'password']))
            throw { code: status.BAD_REQUEST, message: 'Name, email and password are required' };

        const { name, email, password } = req.body;
        const emailExists = await userModel.findByEmail(email.toLowerCase());

        if (emailExists)
            throw { code: status.CONFLICT, message: 'A user with this email already exists' };

        const count = await userModel.count();
        const role = count === 0 ? 'Admin' : 'Member';
        const passwordHash = bcrypt.hashSync(password, 10);

        const user = await userModel.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            role
        });

        const token = signToken({ id: user._id.toString(), role: user.role, email: user.email });

        res.status(status.CREATED).json({ status: true, message: 'User created', data: { user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }, token } });
    },
    async login(req, res) {
        if (!has(req.body, ['email', 'password']))
            throw { code: status.BAD_REQUEST, message: 'Email and password are required' };

        const { email, password } = req.body;
        const user = await userModel.findByEmail(email.toLowerCase());

        if (!user || !bcrypt.compareSync(password, user.passwordHash))
            throw { code: status.UNAUTHORIZED, message: 'Invalid email or password' };

        const token = signToken({ id: user._id.toString(), role: user.role, email: user.email });

        res.json({ status: true, message: 'Login successful', data: { token, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } } });
    }
};