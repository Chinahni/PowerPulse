import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { getAreas } from '../api/power'
import type { Area } from '../api/power'

type FormData = {
  name: string
  email: string
  password: string
  areaId: string
}

const SignUp = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    areaId: '',
  })

  const [emailError, setEmailError] = useState<string>('')
  const [formError, setFormError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [areas, setAreas] = useState<Area[]>([])
  const [areaLoadingError, setAreaLoadingError] = useState<string>('')

  useEffect(() => {
    const loadAreas = async (): Promise<void> => {
      try {
        const areaData = await getAreas()
        setAreas(areaData)
        setFormData((currentData) => ({
          ...currentData,
          areaId: String(areaData[0]?.id ?? ''),
        }))
      } catch (error) {
        setAreaLoadingError('Unable to load area options from backend.')
        console.error(error)
      }
    }

    void loadAreas()
  }, [])

  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.com$/i.test(email)

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setFormError('')

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    if (name === 'email') {
      setEmailError(
        value === '' || isValidEmail(value)
          ? ''
          : 'Email must include @ and end with .com'
      )
    }
  }

  const signUpButton = async (): Promise<void> => {
    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password
    const areaId = Number(formData.areaId)

    if (!name || !email || !password || !formData.areaId) {
      setFormError('Please fill in all fields')
      return
    }

    if (!Number.isInteger(areaId) || areaId < 1) {
      setFormError('Please select a valid area location')
      return
    }

    if (!isValidEmail(formData.email)) {
      setEmailError('Email must include @ and end with .com')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const data = await registerUser({
        name,
        email,
        password,
        area_id: areaId,
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/home')
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to create account. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

 return (
  <div className="min-h-screen bg-green-50 px-6 py-10">
    <div className="mx-auto max-w-md rounded-2xl border border-green-100 bg-white p-8 shadow-sm">
      
      <div className="mb-8">
        <p className="text-3xl font-bold text-green-800">Create account</p>
        <p className="mt-2 text-sm text-green-700">
          Join the community and start reporting power updates.
        </p>
      </div>

      <div className="space-y-5">

        {/* Name */}
        <div>
          <p className="mb-2 text-sm font-medium text-green-900">Name</p>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-200 px-4 py-3"
          />
        </div>

        {/* Email */}
        <div>
          <p className="mb-2 text-sm font-medium text-green-900">Email</p>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-200 px-4 py-3"
          />
          {emailError && (
            <p className="mt-2 text-sm text-red-600">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <p className="mb-2 text-sm font-medium text-green-900">Password</p>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-200 px-4 py-3"
          />
        </div>

        {/* Area location */}
        <div>
          <p className="mb-2 text-sm font-medium text-green-900">
            Area location
          </p>
          <select
            name="areaId"
            value={formData.areaId}
            onChange={handleChange}
            className="w-full rounded-xl border border-green-200 bg-white px-4 py-3"
          >
            <option value="" disabled>
              {areas.length === 0
                ? 'Loading areas...'
                : 'Select your area'}
            </option>
            {areas.map((area) => (
              <option key={area.id} value={String(area.id)}>
                {area.name}, {area.city}
              </option>
            ))}
          </select>
          {areaLoadingError && (
            <p className="mt-2 text-sm text-red-600">{areaLoadingError}</p>
          )}
        </div>

        {/* Button */}
        <button
          disabled={isSubmitting}
          onClick={() => void signUpButton()}
          className="w-full rounded-xl bg-green-700 px-4 py-3 text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
        >
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
        </button>

        {formError && (
          <p className="text-center text-sm text-red-600">{formError}</p>
        )}

      </div>

      <p className="mt-6 text-center text-sm text-green-800">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-green-700">
          Login
        </Link>
      </p>

    </div>
  </div>
)}

export default SignUp
