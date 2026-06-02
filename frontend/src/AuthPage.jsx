import { useState } from 'react'
import { supabase } from './supabase'

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // Handle User Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        })
        if (signUpError) throw signUpError
        
        // Supabase behavior depending on if confirmation is enabled
        if (data?.user && data.user.identities?.length === 0) {
          setError('This email address is already registered.')
        } else {
          setMessage('Account successfully created! You can now log in.')
          setIsSignUp(false)
        }
      } else {
        // Handle User Log In
        const { error: logInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })
        if (logInError) throw logInError
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 items-center justify-center text-white font-bold text-2xl shadow-sm">
            S
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            DataStraw CRM
          </h2>
          <p className="text-sm text-gray-500">
            {isSignUp ? 'Create a support account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 pb-1">
          <button
            onClick={() => {
              setIsSignUp(false)
              setError(null)
              setMessage(null)
            }}
            className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-all ${
              !isSignUp
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setIsSignUp(true)
              setError(null)
              setMessage(null)
            }}
            className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-all ${
              isSignUp
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {message && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs border border-emerald-100 font-semibold animate-fade-in">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-100 font-semibold animate-fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors focus:outline-none disabled:bg-blue-300 cursor-pointer text-center"
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthPage
