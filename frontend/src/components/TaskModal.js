import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import api from '../api'
import toast from 'react-hot-toast'

const STAGE_STYLES = {
    'Requested':   { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
    'To do':       { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
    'In Progress': { bg: 'bg-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-500'  },
    'Done':        { bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500'   },
}

const TaskModal = ({ isOpen, setIsOpen, id }) => {
    const [taskData, setTaskData] = useState(null)

    const capitalizeFirstLetter = (string) => {
        return string ? string.charAt(0).toUpperCase() + string.slice(1) : ''
    }

    // format date e.g. "28 May 2026"
    const formatDate = (id) => {
        if (!id) return '—'
        const timestamp = parseInt(id.substring(0, 8), 16) * 1000
        return new Date(timestamp).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })
    }

    useEffect(() => {
        if (isOpen) {
            api.get(`/project/${id.projectId}/task/${id.id}`)
                .then((data) => {
                    setTaskData({ ...data.data[0].task[0] })
                })
                .catch(() => {
                    toast.error('Something went wrong')
                })
        } else {
            setTaskData(null)
        }
    }, [isOpen])

    const stage = taskData?.stage || 'Requested'
    const stageStyle = STAGE_STYLES[stage] || STAGE_STYLES['Requested']

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as='div' open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 overflow-y-auto">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4 w-screen h-screen">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="rounded-md bg-white max-w-[85%] w-[85%] h-[85%] overflow-y-hidden flex flex-col">

                                {/* Header */}
                                <Dialog.Title as='div' className='bg-white shadow px-6 py-4 rounded-t-md flex-shrink-0'>
                                    <h1 className='font-medium text-gray-700'>Task details</h1>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className='absolute right-6 top-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded focus:outline-none focus:ring focus:ring-offset-1 focus:ring-gray-300'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dialog.Title>

                                {/* Body */}
                                <div className='flex gap-0 flex-1 overflow-hidden'>

                                    {/* Left panel — title & description */}
                                    <div className="w-8/12 px-8 py-6 overflow-y-auto space-y-4 border-r border-gray-100">
                                        {taskData ? (
                                            <>
                                                <h1 className='text-2xl font-semibold text-gray-800'>
                                                    {capitalizeFirstLetter(taskData.title)}
                                                </h1>
                                                <div>
                                                    <h3 className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>Description</h3>
                                                    <p className='text-gray-600 leading-relaxed'>
                                                        {capitalizeFirstLetter(taskData.description)}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className='flex items-center justify-center h-full'>
                                                <div className='w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin'></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right panel — task metadata */}
                                    <div className="w-4/12 py-6 px-6 overflow-y-auto bg-gray-50/60">
                                        {taskData ? (
                                            <div className='space-y-5'>

                                                {/* Stage */}
                                                <div>
                                                    <h3 className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>Stage</h3>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${stageStyle.bg} ${stageStyle.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stageStyle.dot}`}></span>
                                                        {stage}
                                                    </span>
                                                </div>

                                                {/* Task number */}
                                                <div>
                                                    <h3 className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>Task number</h3>
                                                    <span className='text-sm font-mono text-gray-600 bg-gray-100 px-2.5 py-1 rounded'>
                                                        #{taskData.index}
                                                    </span>
                                                </div>

                                                {/* Created date */}
                                                <div>
                                                    <h3 className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>Created</h3>
                                                    <span className='text-sm text-gray-600 flex items-center gap-1.5'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
                                                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                                                        </svg>
                                                        {formatDate(taskData._id)}
                                                    </span>
                                                </div>

                                                {/* Divider */}
                                                <div className='border-t border-gray-200'></div>

                                                {/* Task ID */}
                                                <div>
                                                    <h3 className='text-xs font-medium text-gray-400 uppercase tracking-wider mb-2'>Task ID</h3>
                                                    <span className='text-xs font-mono text-gray-400 break-all'>
                                                        {taskData._id}
                                                    </span>
                                                </div>

                                            </div>
                                        ) : (
                                            <div className='flex items-center justify-center h-full'>
                                                <div className='w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin'></div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default TaskModal