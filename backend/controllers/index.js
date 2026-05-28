import mongoose from 'mongoose';
import joi from 'joi';
import Project from '../models/index.js'

// ── Project Controllers ───────────────────────────────────

export const getAllProjects = async (req, res) => {
    try {
        const data = await Project.find({}, { task: 0, __v: 0, updatedAt: 0 })
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const getProjectById = async (req, res) => {
    if (!req.params.id) return res.status(422).send({ error: true, message: 'Id is required' })
    try {
        const data = await Project.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).sort({ order: 1 })
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
        const data = await new Project(value).save()
        res.send({ data: { title: data.title, description: data.description, updatedAt: data.updatedAt, _id: data._id } })
    } catch (e) {
        if (e.code === 11000) {
            return res.status(422).send({ data: { error: true, message: 'Title must be unique' } })
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
        const data = await Project.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { ...value },
            { upsert: true }
        )
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
}

export const deleteProject = async (req, res) => {
    try {
        const data = await Project.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
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
        const [{ task }] = await Project.find(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { "task.index": 1 }
        ).sort({ 'task.index': 1 })

        let countTaskLength = [
            task.length,
            task.length > 0 ? Math.max(...task.map(o => o.index)) : task.length
        ]

        const data = await Project.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
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
        const data = await Project.find(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
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
        if (data[0].task.length < 1) return res.status(404).send({ error: true, message: 'Record not found' })
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
        const data = await Project.updateOne(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                task: { $elemMatch: { _id: new mongoose.Types.ObjectId(req.params.taskId) } }
            },
            { $set: { "task.$.title": value.title, "task.$.description": value.description } }
        )
        return res.send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
}

export const deleteTask = async (req, res) => {
    if (!req.params.id || !req.params.taskId) return res.status(500).send('Server error')

    try {
        const data = await Project.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $pull: { task: { _id: new mongoose.Types.ObjectId(req.params.taskId) } } }
        )
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

    await Promise.all(todo.map(async (item) => {
        await Project.updateOne(
            {
                _id: new mongoose.Types.ObjectId(req.params.id),
                task: { $elemMatch: { _id: new mongoose.Types.ObjectId(item.name) } }
            },
            { $set: { "task.$.order": item.order, "task.$.stage": item.stage } }
        )
    }))

    res.send(todo)
}