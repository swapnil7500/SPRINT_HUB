import express from "express"
import dotenv from 'dotenv'
import mongoose from "mongoose"
import cors from "cors"
import api from './routes/index.js'
import authRoutes from './routes/auth.js'

dotenv.config()

// DB connect
mongoose.connect(process.env.MONGODB_PATH)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((e) => console.log('❌ MongoDB connection error:', e))

const PORT = process.env.SERVER_PORT || 9000
const origin = process.env.CORS_ORIGIN || 'http://localhost:3000'

const app = express()

app.use(cors({ origin }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Public routes — no auth needed
app.use('/auth', authRoutes)

// ✅ Protected routes — JWT required
app.use(api)

// Root health check
app.get('/', (req, res) => {
    res.json({ message: '🚀 Sprint Hub API is running!' })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err)
    res.status(500).json({ error: true, message: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`)
})