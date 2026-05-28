import AppLayout from "./components/AppLayout"
import { Routes, Route } from "react-router-dom"
import Task from "./components/Task"
import Login from "./components/Login"
import Signup from "./components/Signup"
import ProtectedRoute from "./components/ProtectedRoute"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <>
      <Toaster position="top-right" gutter={8} />
      <Routes>

        {/* ── Public routes — no login needed ── */}
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        {/* ── Protected routes — login required ── */}
        <Route path='/' element={
          <ProtectedRoute>
            <AppLayout>
              <div className="flex flex-col items-center w-full pt-10">
                <img src="./image/welcome.svg" className="w-5/12" alt="Welcome" />
                <h1 className="text-lg text-gray-600">Select or create a new project</h1>
              </div>
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path='/:projectId' element={
          <ProtectedRoute>
            <AppLayout>
              <Task />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* ── 404 ── */}
        <Route path='*' element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-300">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.284 0 4.608-.153.134-.315.245-.48.334v.048a.75.75 0 01-1.5 0v-.5c0-.276.179-.506.452-.564A1.5 1.5 0 0013.628 9.5c0-.332-.116-.65-.328-.856a1.5 1.5 0 00-.672-.561zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-700 mb-1">Page not found</h1>
              <p className="text-gray-400 text-sm">The page you're looking for doesn't exist.</p>
            </div>
            <a href="/" className="mt-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              Go back home
            </a>
          </div>
        } />

      </Routes>
    </>
  )
}

export default App