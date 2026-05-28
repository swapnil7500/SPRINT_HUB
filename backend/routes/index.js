import express from 'express'
import protect from '../middleware/auth.js'
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskOrder,
} from '../controllers/index.js'

const api = express.Router()

// ✅ All routes below are protected — require valid JWT
api.use(protect)

// ── Project Routes ────────────────────────────────────────
api.get('/projects',          getAllProjects)
api.get('/project/:id',       getProjectById)
api.post('/project',          createProject)
api.put('/project/:id',       updateProject)
api.delete('/project/:id',    deleteProject)

// ── Task Routes ───────────────────────────────────────────
api.post('/project/:id/task',              createTask)
api.get('/project/:id/task/:taskId',       getTaskById)
api.put('/project/:id/task/:taskId',       updateTask)
api.delete('/project/:id/task/:taskId',    deleteTask)
api.put('/project/:id/todo',               updateTaskOrder)

export default api