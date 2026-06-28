import useCurrent from '../hooks/auth/useCurrent'
import { useNavigate } from 'react-router'
import { homeForRole } from '../utils/helpers/role'
import { FaMapLocationDot } from "react-icons/fa6"

function NotFound() {
  const { data: user } = useCurrent()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(user ? homeForRole(user.role) : "/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9ff] px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#d8e2ff] text-[#0058be] shadow-sm border border-[#c6c6cd]/30">
        <FaMapLocationDot className="h-10 w-10" />
      </div>
      
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-[#0b1c30] sm:text-5xl">
        Page Not Found
      </h1>
      
      <p className="mb-8 max-w-md text-base leading-relaxed text-[#45464d]">
        Oops! We couldn't find the page you were looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      
      <button 
        onClick={handleBack} 
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0b1c30] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#213145] active:scale-[0.98]"
      >
        Go to Dashboard
      </button> 
    </div>
  )
}

export default NotFound
