import mongoose from 'mongoose';
import joi from 'joi';
import Project from '../models/index.js'

// ── Project Controllers ───────────────────────────────────

export const getAllProjects = async (req, res) => {
    try {
        // ✅ Only return projects owned by the logged-in user
        const data = await Project.find(
            { owner: req.user.id },
            { task: 0, __v: 0, updatedAt: 0 }
        )
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const getProjectById = async (req, res) => {
    if (!req.params.id) return res.status(422).send({ error: true, message: 'Id is required' })
    try {
        // ✅ Only fetch project if it belongs to logged-in user
        const data = await Project.find({
            _id: new mongoose.Types.ObjectId(req.params.id),
            owner: req.user.id
        }).sort({ order: 1 })
        if (!data.length) return res.status(404).send({ error: true, message: 'Project not found' })
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const createProject = async (req, res) => {
    const schema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    })

    const { error, value } = schema.validate({ title: req.body.title, description: req.body.description })
    if (error) return res.status(422).send(error)

    try {
        // ✅ Save project with owner set to logged-in user's id
        const data = await new Project({ ...value, owner: req.user.id }).save()
        res.send({ data: { title: data.title, description: data.description, updatedAt: data.updatedAt, _id: data._id } })
    } catch (e) {
        if (e.code === 11000) {
            return res.status(422).send({ data: { error: true, message: 'You already have a project with this title' } })
        } else {
            return res.status(500).send({ data: { error: true, message: 'Server error' } })
        }
    }
}

export const updateProject = async (req, res) => {
    const schema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    })

    const { error, value } = schema.validate({ title: req.body.title, description: req.body.description })
    if (error) return res.status(422).send(error)

    try {
        // ✅ Only update if project belongs to logged-in user
        const data = await Project.updateOne(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                owner: req.user.id
            },
            { ...value }
        )
        if (data.matchedCount === 0) return res.status(404).send({ error: true, message: 'Project not found' })
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
}

export const deleteProject = async (req, res) => {
    try {
        // ✅ Only delete if project belongs to logged-in user
        const data = await Project.deleteOne({
            _id: new mongoose.Types.ObjectId(req.params.id),
            owner: req.user.id
        })
        if (data.deletedCount === 0) return res.status(404).send({ error: true, message: 'Project not found' })
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
}

// ── Task Controllers ──────────────────────────────────────

export const createTask = async (req, res) => {
    if (!req.params.id) return res.status(500).send('Server error')

    const schema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    })

    const { error, value } = schema.validate({ title: req.body.title, description: req.body.description })
    if (error) return res.status(422).send(error)

    try {
        // ✅ Verify project belongs to logged-in user before adding task
        const projects = await Project.find(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                owner: req.user.id
            },
            { "task.index": 1 }
        ).sort({ 'task.index': 1 })

        if (!projects.length) return res.status(404).send({ error: true, message: 'Project not found' })

        const [{ task }] = projects
        let countTaskLength = [
            task.length,
            task.length > 0 ? Math.max(...task.map(o => o.index)) : task.length
        ]

        const data = await Project.updateOne(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                owner: req.user.id
            },
            { $push: { task: { ...value, stage: "Requested", order: countTaskLength[0], index: countTaskLength[1] + 1 } } }
        )
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const getTaskById = async (req, res) => {
    if (!req.params.id || !req.params.taskId) return res.status(500).send('Server error')

    try {
        // ✅ Verify project belongs to logged-in user before fetching task
        const data = await Project.find(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                owner: req.user.id
            },
            {
                task: {
                    $filter: {
                        input: "$task",
                        as: "task",
                        cond: {
                            $in: [
                                "$$task._id",
                                [new mongoose.Types.ObjectId(req.params.taskId)]
                            ]
                        }
                    }
                }
            }
        )
        if (!data.length || data[0].task.length < 1) return res.status(404).send({ error: true, message: 'Record not found' })
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const updateTask = async (req, res) => {
    if (!req.params.id || !req.params.taskId) return res.status(500).send('Server error')

    const schema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    })

    const { error, value } = schema.validate({ title: req.body.title, description: req.body.description })
    if (error) return res.status(422).send(error)

    try {
        // ✅ Verify project belongs to logged-in user before updating task
        const data = await Project.updateOne(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                owner: req.user.id,
                task: { $elemMatch: { _id: new mongoose.Types.ObjectId(req.params.taskId) } }
            },
            { $set: { "task.$.title": value.title, "task.$.description": value.description } }
        )
        if (data.matchedCount === 0) return res.status(404).send({ error: true, message: 'Task not found' })
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const deleteTask = async (req, res) => {
    if (!req.params.id || !req.params.taskId) return res.status(500).send('Server error')

    try {
        // ✅ Verify project belongs to logged-in user before deleting task
        const data = await Project.updateOne(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                owner: req.user.id
            },
            { $pull: { task: { _id: new mongoose.Types.ObjectId(req.params.taskId) } } }
        )
        if (data.matchedCount === 0) return res.status(404).send({ error: true, message: 'Task not found' })
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const updateTaskOrder = async (req, res) => {
    let todo = []

    for (const key in req.body) {
        for (const index in req.body[key].items) {
            req.body[key].items[index].stage = req.body[key].name
            todo.push({
                name: req.body[key].items[index]._id,
                stage: req.body[key].items[index].stage,
                order: index
            })
        }
    }

    // ✅ Verify project belongs to logged-in user before updating order
    await Promise.all(todo.map(async (item) => {
        await Project.updateOne(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                owner: req.user.id,
                task: { $elemMatch: { _id: new mongoose.Types.ObjectId(item.name) } }
            },
            { $set: { "task.$.order": item.order, "task.$.stage": item.stage } }
        )
    }))

    res.send(todo)
}