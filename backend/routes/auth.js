import express from 'express'
import jwt from 'jsonwebtoken'
import joi from 'joi'
import User from '../models/User.js'

const router = express.Router()

// helper — generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}

// POST /auth/register
router.post('/register', async (req, res) => {
    const schema = joi.object({
        name: joi.string().min(2).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    })

    const { error, value } = schema.validate(req.body)
    if (error) return res.status(422).json({ error: true, message: error.details[0].message })

    try {
        const existing = await User.findOne({ email: value.email })
        if (existing) {
            return res.status(422).json({ error: true, message: 'An account with this email already exists.' })
        }

        const user = await new User(value).save()
        const token = generateToken(user)

        return res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    } catch (err) {
        return res.status(500).json({ error: true, message: 'Server error' })
    }
})

// POST /auth/login
router.post('/login', async (req, res) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    })

    const { error, value } = schema.validate(req.body)
    if (error) return res.status(422).json({ error: true, message: error.details[0].message })

    try {
        const user = await User.findOne({ email: value.email })
        if (!user) {
            return res.status(401).json({ error: true, message: 'Invalid email or password.' })
        }

        const isMatch = await user.comparePassword(value.password)
        if (!isMatch) {
            return res.status(401).json({ error: true, message: 'Invalid email or password.' })
        }

        const token = generateToken(user)

        return res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    } catch (err) {
        return res.status(500).json({ error: true, message: 'Server error' })
    }
})

export default router