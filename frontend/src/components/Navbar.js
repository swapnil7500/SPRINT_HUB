import React from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Navbar = () => {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        toast.success('Logged out successfully')
        navigate('/login')
    }

    return (
        <div className='bg-white shadow h-14 flex items-center px-6 justify-between sticky top-0 z-40'>

            {/* Left — Logo + App name */}
            <div className='flex items-center gap-2.5'>
                <div className='bg-indigo-600 rounded-lg w-7 h-7 flex items-center justify-center flex-shrink-0'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
                        <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.742c-.094.09-.193.175-.274.258zM12.738 17.625l6.474-6.474a1.875 1.875 0 000-2.651L15.5 4.787a1.875 1.875 0 00-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375z" />
                    </svg>
                </div>
                <span className='font-semibold text-gray-800 text-lg tracking-tight'>Sprint Hub</span>
            </div>

            {/* Right — user info + logout */}
            {user && (
                <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-indigo-200 flex-shrink-0'>
                            <span className='text-indigo-700 text-sm font-semibold uppercase'>
                                {user.name?.charAt(0)}
                            </span>
                        </div>
                        <span className='text-sm text-gray-600 hidden sm:block'>{user.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
                        </svg>
                        <span className='hidden sm:block'>Logout</span>
                    </button>
                </div>
            )}

        </div>
    )
}

export default Navbar