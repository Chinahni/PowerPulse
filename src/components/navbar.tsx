import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { label: 'Home', to: '/home' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Areas', to: '/areafeed' },
  { label: 'Insights', to: '/insights' },
  { label: 'Following', to: '/following' },
]

const Navbar = () => {
  const navigate = useNavigate()

  const logout = (): void => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
  <nav className="sticky top-0 z-20 border-b border-green-100 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      
      {/* LOGO */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-700 text-sm font-semibold text-white">
          PP
        </div>

        <div>
          <p className="text-base font-semibold tracking-tight text-green-950">
            PowerPulse
          </p>
          <p className="text-xs text-green-800/70">
            Community power intelligence
          </p>
        </div>
      </div>

      {/* LINKS */}
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-800 hover:bg-green-50 hover:text-green-900'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
)
}

export default Navbar
