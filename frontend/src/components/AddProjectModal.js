import React, { Fragment, memo, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import BtnPrimary from './BtnPrimary'
import BtnSecondary from './BtnSecondary'
import api from '../api'
import toast from 'react-hot-toast'

const AddProjectModal = ({ isModalOpen, closeModal, edit = false, id = null }) => {

    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [errors, setErrors] = useState({})  // ✅ validation errors state

    // ✅ clear form + errors when modal opens/closes
    useEffect(() => {
        if (!isModalOpen) {
            setErrors({})
            if (!edit) {
                setTitle('')
                setDesc('')
            }
        }
        if (edit && isModalOpen) {
            api.get(`/project/${id}`)
                .then((res) => {
                    setTitle(res.data[0].title)
                    setDesc(res.data[0].description)
                })
                .catch(() => toast.error('Something went wrong'))
        }
    }, [isModalOpen])

    // ✅ validate fields, return true if valid
    const validate = () => {
        const newErrors = {}
        if (!title.trim()) {
            newErrors.title = 'Title is required'
        } else if (title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters'
        } else if (title.trim().length > 30) {
            newErrors.title = 'Title must be under 30 characters'
        }
        if (!desc.trim()) {
            newErrors.desc = 'Description is required'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return   // ✅ stop if invalid

        if (!edit) {
            api.post('/project/', { title, description: desc })
                .then((res) => {
                    closeModal()
                    const customEvent = new CustomEvent('projectUpdate', { detail: { ...res.data } })
                    document.dispatchEvent(customEvent)
                    toast.success('Project created successfully')
                    setTitle('')
                    setDesc('')
                    setErrors({})
                })
                .catch((error) => {
                    if (error.response?.status === 422) {
                        toast.error(error.response.data.details?.[0]?.message || 'Validation error')
                    } else {
                        toast.error('Something went wrong')
                    }
                })
        } else {
            api.put(`/project/${id}`, { title, description: desc })
                .then((res) => {
                    closeModal()
                    const customEvent = new CustomEvent('projectUpdate', { detail: { ...res.data } })
                    document.dispatchEvent(customEvent)
                    toast.success('Project updated successfully')
                    setTitle('')
                    setDesc('')
                    setErrors({})
                })
                .catch((error) => {
                    if (error.response?.status === 422) {
                        toast.error(error.response.data.details?.[0]?.message || 'Validation error')
                    } else {
                        toast.error('Something went wrong')
                    }
                })
        }
    }

    return (
        <Transition appear show={isModalOpen} as={Fragment}>
            <Dialog as='div' open={isModalOpen} onClose={() => closeModal()} className="relative z-50">
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
                            <Dialog.Panel className="rounded-md bg-white w-6/12">

                                <Dialog.Title as='div' className='bg-white shadow px-6 py-4 rounded-t-md sticky top-0'>
                                    {edit ? (<h1>Edit Project</h1>) : (<h1>Create Project</h1>)}
                                    <button onClick={() => closeModal()} className='absolute right-6 top-4 text-gray-500 hover:bg-gray-100 rounded focus:outline-none focus:ring focus:ring-offset-1 focus:ring-indigo-200'>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className='gap-4 px-8 py-4' noValidate>
                                    <div className='mb-3'>
                                        <label htmlFor="title" className='block text-gray-600 mb-1'>
                                            Title <span className='text-red-400'>*</span>
                                        </label>
                                        <input
                                            id="title"
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value)
                                                if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
                                            }}
                                            type="text"
                                            className={`border rounded-md w-full text-sm py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500'}`}
                                            placeholder='Project title'
                                        />
                                        {/* ✅ inline error message */}
                                        {errors.title && (
                                            <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>
                                    <div className='mb-4'>
                                        <label htmlFor="description" className='block text-gray-600 mb-1'>
                                            Description <span className='text-red-400'>*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            value={desc}
                                            onChange={(e) => {
                                                setDesc(e.target.value)
                                                if (errors.desc) setErrors(prev => ({ ...prev, desc: '' }))
                                            }}
                                            className={`border rounded-md w-full text-sm py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors ${errors.desc ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500'}`}
                                            rows="5"
                                            placeholder='Project description'
                                        />
                                        {/* ✅ inline error message */}
                                        {errors.desc && (
                                            <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                {errors.desc}
                                            </p>
                                        )}
                                    </div>
                                    <div className='flex justify-end items-center space-x-2'>
                                        <BtnSecondary onClick={() => closeModal()}>Cancel</BtnSecondary>
                                        <BtnPrimary type="submit">Save</BtnPrimary>
                                    </div>
                                </form>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default memo(AddProjectModal)