/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { Route } from "react-router-dom"
const AuthRedirect = lazy(() => import("../components/auth/AuthRedirect"))
import AuthLayout from "../layouts/AuthLayout"
const Signin = lazy(() => import("../pages/auth/Signin"))

export const authRoutes = (
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<AuthRedirect><Signin /></AuthRedirect>} />
    <Route path="/signin" element={<AuthRedirect><Signin /></AuthRedirect>} />
  </Route>
)
