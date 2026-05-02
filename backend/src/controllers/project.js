const status = require('http-status');
const has = require('has-keys');
const projectModel = require('@models/projects.js');
const userModel = require('@models/users.js');

function ensureProjectAccess(project, user) {
    if (!project)
        throw { code: status.NOT_FOUND, message: 'Project not found' };

    if (user.role !== 'Admin' && project.ownerId !== user.id && !project.members.includes(user.id))
        throw { code: status.FORBIDDEN, message: 'Access denied to this project' };
}

module.exports = {
    async createProject(req, res) {
        if (!has(req.body, ['name', 'description']))
            throw { code: status.BAD_REQUEST, message: 'Project name and description are required' };

        const { name, description } = req.body;
        const project = await projectModel.create({
            name,
            description,
            ownerId: req.user.id,
            members: []
        });

        res.status(status.CREATED).json({ status: true, message: 'Project created', data: project });
    },
    async getProjects(req, res) {
        const projects = req.user.role === 'Admin'
            ? await projectModel.findAll()
            : await projectModel.findByUser(req.user.id);

        res.json({ status: true, message: 'Returning projects', data: projects });
    },
    async getProjectById(req, res) {
        const project = await projectModel.findById(req.params.id);
        ensureProjectAccess(project, req.user);
        res.json({ status: true, message: 'Returning project', data: project });
    },
    async updateProject(req, res) {
        if (!has(req.body, ['name', 'description']))
            throw { code: status.BAD_REQUEST, message: 'Project name and description are required' };

        const project = await projectModel.findById(req.params.id);
        ensureProjectAccess(project, req.user);

        const updated = await projectModel.updateById(req.params.id, {
            name: req.body.name,
            description: req.body.description
        });

        res.json({ status: true, message: 'Project updated', data: updated });
    },
    async addMember(req, res) {
        if (!has(req.body, ['memberId']))
            throw { code: status.BAD_REQUEST, message: 'memberId is required' };

        const member = await userModel.findById(req.body.memberId);
        if (!member)
            throw { code: status.BAD_REQUEST, message: 'Member not found' };

        const project = await projectModel.addMember(req.params.id, req.body.memberId);
        res.json({ status: true, message: 'Member added to project', data: project });
    },
    async removeMember(req, res) {
        const project = await projectModel.removeMember(req.params.id, req.params.memberId);
        res.json({ status: true, message: 'Member removed from project', data: project });
    }
};