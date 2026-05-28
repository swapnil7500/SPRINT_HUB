import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const validate = () => {
        const newErrors = {}
        if (!email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email'
        if (!password) newErrors.password = 'Password is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setIsLoading(true)
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            toast.success(`Welcome back, ${res.data.user.name}!`)
            navigate('/')
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong'
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    const ErrorMsg = ({ msg }) => msg ? (
        <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {msg}
        </p>
    ) : null

    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
            <div className='w-full max-w-md'>

                {/* Logo */}
                <div className='flex items-center justify-center gap-2.5 mb-8'>
                    <div className='bg-indigo-600 rounded-lg w-9 h-9 flex items-center justify-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                            <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
                            <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.742c-.094.09-.193.175-.274.258zM12.738 17.625l6.474-6.474a1.875 1.875 0 000-2.651L15.5 4.787a1.875 1.875 0 00-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375z" />
                        </svg>
                    </div>
                    <span className='font-semibold text-gray-800 text-xl'>Sprint Hub</span>
                </div>

                {/* Card */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
                    <h1 className='text-2xl font-semibold text-gray-800 mb-1'>Welcome back</h1>
                    <p className='text-gray-500 text-sm mb-6'>Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit} noValidate className='space-y-4'>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })) }}
                                className={`w-full border rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                placeholder='you@example.com'
                            />
                            <ErrorMsg msg={errors.email} />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })) }}
                                className={`w-full border rounded-lg text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                placeholder='Your password'
                            />
                            <ErrorMsg msg={errors.password} />
                        </div>

                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2'
                        >
                            {isLoading && <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p className='text-center text-sm text-gray-500 mt-5'>
                    Don't have an account?{' '}
                    <Link to='/signup' className='text-indigo-600 font-medium hover:underline'>Create one</Link>
                </p>
            </div>
        </div>
    )
}

export default Login