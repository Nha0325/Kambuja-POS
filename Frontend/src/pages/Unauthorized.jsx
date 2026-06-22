import useCurrent from '../hooks/auth/useCurrent'
import { useNavigate } from 'react-router'
import { homeForRole } from '../utils/role'

function Unauthorized() {
  const {data:user} = useCurrent()
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(user ? homeForRole(user.role) : "/login")
  }
  return (
    <div className='flex items-center justify-center min-h-screen'>
        <h1 className='text-4x font-bold'>Unauthorized</h1>
        <button onClick={handleBack} className='btn'>Back</button> 
    </div>
  )
}

export default Unauthorized
