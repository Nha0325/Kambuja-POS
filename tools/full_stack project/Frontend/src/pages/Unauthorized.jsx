import useCurrent from '../hooks/auth/useCurrent'
import { useNavigate } from 'react-router'

function Unauthorized() {
  const {data:user} = useCurrent()
  const navigate = useNavigate()
  const handleBack = () => {
    if(user?.role == "cashier"){
        navigate('/cashier/pos')
    }else if(user?.role == "super" || user?.role == "admin"){
        navigate('/')
    }else{
        navigate('/signin')
    }
  }
  return (
    <div className='flex items-center justify-center min-h-screen'>
        <h1 className='text-4x font-bold'>Unauthorized</h1>
        <button onClick={handleBack} className='btn'>Back</button> 
    </div>
  )
}

export default Unauthorized