import { Route } from "react-router-dom"
import AuthRedirect from "../components/auth/AuthRedirect"
import AuthLayout from "../layouts/AuthLayout"
import Signin from "../pages/auth/Signin"

export const authRoutes = (
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<AuthRedirect><Signin /></AuthRedirect>} />
    <Route path="/signin" element={<AuthRedirect><Signin /></AuthRedirect>} />
  </Route>
)
