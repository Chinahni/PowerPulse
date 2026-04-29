import {  useState } from 'react'
import type {ChangeEvent} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { loginUser } from '../api/auth'

type LoginData = {
  email: string
  password: string
}

const Login = () => {
  const navigate = useNavigate()
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormError('')

    setLoginData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleLogin = async (): Promise<void> => {
    const email = loginData.email.trim()
    const password = loginData.password

    if (!email || !password) {
      setFormError('Please enter your email and password')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const data = await loginUser({ email, password })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/home')
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to log in. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

 return (
  <div className="min-h-screen bg-green-50 px-6 py-10">
    <div className="mx-auto max-w-md rounded-2xl border border-green-100 bg-white p-8 shadow-sm">
      
      {/* Header */}
      <div className="mb-8">
        <p className="text-3xl font-bold text-green-800">Welcome back</p>
        <p className="mt-2 text-sm text-green-700">
          Log in to continue tracking power updates.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">

        {/* Email */}
        <div>
          <p className="mb-2 text-sm font-medium text-green-900">
            E-mail Address
          </p>
          <input
            name="email"
            type="email"
            placeholder="E-mail address"
            value={loginData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Password */}
        <div>
          <p className="mb-2 text-sm font-medium text-green-900">
            Password
          </p>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-900 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Button */}
        <button
          disabled={isSubmitting}
          onClick={() => void handleLogin()}
          className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        {formError && (
          <p className="text-center text-sm text-red-600">{formError}</p>
        )}

        {/* Redirect */}
        <p className="text-center text-sm text-green-800">
          Need an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-green-700 hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  </div>
)
}

export default Login
