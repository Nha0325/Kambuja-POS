import useCurrent from '../hooks/auth/useCurrent'
import { useNavigate } from 'react-router'
import { homeForRole } from '../utils/role'
import { FaShieldHalved } from "react-icons/fa6"

function Unauthorized() {
  const { data: user } = useCurrent()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(user ? homeForRole(user.role) : "/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9ff] px-4 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm border border-red-200">
        <FaShieldHalved className="h-10 w-10" />
      </div>
      
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-[#0b1c30] sm:text-5xl">
        Access Denied
      </h1>
      
      <p className="mb-8 max-w-md text-base leading-relaxed text-[#45464d]">
        You don't have the necessary permissions to view this page. If you believe this is a mistake, please contact your administrator.
      </p>
      
      <button 
        onClick={handleBack} 
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0b1c30] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#213145] active:scale-[0.98]"
      >
        Return to Safety
      </button> 
    </div>
  )
}

export default Unauthorized
