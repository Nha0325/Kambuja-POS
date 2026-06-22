import { Outlet } from "react-router"

function AuthLayout() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Outlet />
    </main>
  )
}

export default AuthLayout
