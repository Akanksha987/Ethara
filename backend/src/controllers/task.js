const status = require('http-status');
const has = require('has-keys');
const taskModel = require('@models/tasks.js');
const projectModel = require('@models/projects.js');

const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

function ensureProjectAccess(project, user) {
    if (!project)
        throw { code: status.NOT_FOUND, message: 'Project not found' };
    if (user.role !== 'Admin' && project.ownerId !== user.id && !project.members.includes(user.id))
        throw { code: status.FORBIDDEN, message: 'Access denied to this project' };
}

function ensureTaskAccess(task, user, project) {
    if (!task)
        throw { code: status.NOT_FOUND, message: 'Task not found' };
    if (user.role === 'Admin') return;
    if (task.assigneeId === user.id) return;
    if (project && (project.ownerId === user.id || project.members.includes(user.id))) return;
    throw { code: status.FORBIDDEN, message: 'Access denied to this task' };
}

module.exports = {
    async createTask(req, res) {
        if (!has(req.body, ['title', 'description', 'assigneeId', 'dueDate']))
            throw { code: status.BAD_REQUEST, message: 'Task title, description, assigneeId, and dueDate are required' };

        const project = await projectModel.findById(req.params.projectId);
        ensureProjectAccess(project, req.user);

        if (!project.members.includes(req.body.assigneeId) && project.ownerId !== req.body.assigneeId)
            throw { code: status.BAD_REQUEST, message: 'Assignee must be a member of the project' };

        const statusValue = req.body.status || 'TODO';
        if (!validStatuses.includes(statusValue))
            throw { code: status.BAD_REQUEST, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` };

        const task = await taskModel.create({
            title: req.body.title,
            description: req.body.description,
            projectId: req.params.projectId,
            assigneeId: req.body.assigneeId,
            status: statusValue,
            dueDate: new Date(req.body.dueDate)
        });

        res.status(status.CREATED).json({ status: true, message: 'Task created', data: task });
    },
    async getTasks(req, res) {
        const projectId = req.query.projectId;
        let tasks = [];

        if (projectId) {
            const project = await projectModel.findById(projectId);
            ensureProjectAccess(project, req.user);
            tasks = await taskModel.findByProject(projectId);
        } else if (req.user.role === 'Admin') {
            tasks = await taskModel.findAll();
        } else {
            const projects = await projectModel.findByUser(req.user.id);
            const projectIds = projects.map(project => project._id.toString());
            const assignedTasks = await taskModel.findByUser(req.user.id);
            const projectTasks = projectIds.length ? await taskModel.findByProjectIds(projectIds) : [];
            const combined = [...assignedTasks, ...projectTasks];
            const uniqueTasks = combined.reduce((acc, task) => {
                acc[task._id.toString()] = task;
                return acc;
            }, {});
            tasks = Object.values(uniqueTasks);
        }

        res.json({ status: true, message: 'Returning tasks', data: tasks });
    },
    async getTaskById(req, res) {
        const task = await taskModel.findById(req.params.id);
        const project = task ? await projectModel.findById(task.projectId) : null;
        ensureTaskAccess(task, req.user, project);
        res.json({ status: true, message: 'Returning task', data: task });
    },
    async updateTask(req, res) {
        const task = await taskModel.findById(req.params.id);
        const project = task ? await projectModel.findById(task.projectId) : null;
        ensureTaskAccess(task, req.user, project);

        const updates = {};
        if (req.body.title) updates.title = req.body.title;
        if (req.body.description) updates.description = req.body.description;
        if (req.body.status) {
            if (!validStatuses.includes(req.body.status))
                throw { code: status.BAD_REQUEST, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` };
            updates.status = req.body.status;
        }
        if (req.body.dueDate) updates.dueDate = new Date(req.body.dueDate);
        if (req.body.assigneeId) {
            if (!project || (!project.members.includes(req.body.assigneeId) && project.ownerId !== req.body.assigneeId))
                throw { code: status.BAD_REQUEST, message: 'Assignee must be a project member' };
            updates.assigneeId = req.body.assigneeId;
        }

        const updated = await taskModel.updateById(req.params.id, updates);
        res.json({ status: true, message: 'Task updated', data: updated });
    },
    async getDashboard(req, res) {
        let tasks;
        if (req.user.role === 'Admin') {
            tasks = await taskModel.findAll();
        } else {
            const projects = await projectModel.findByUser(req.user.id);
            const projectIds = projects.map(project => project._id.toString());
            const assignedTasks = await taskModel.findByUser(req.user.id);
            const projectTasks = projectIds.length ? await taskModel.findByProjectIds(projectIds) : [];
            const combined = [...assignedTasks, ...projectTasks];
            const uniqueTasks = combined.reduce((acc, task) => {
                acc[task._id.toString()] = task;
                return acc;
            }, {});
            tasks = Object.values(uniqueTasks);
        }

        const overdue = tasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'DONE');
        const summary = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            status: true,
            message: 'Dashboard data',
            data: {
                tasks,
                summary,
                overdue
            }
        });
    }
};