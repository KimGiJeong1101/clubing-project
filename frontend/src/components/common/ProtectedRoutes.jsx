//import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes = ({ isAuth }) => {
  return (
    isAuth ? <Outlet /> : <Navigate to={'/login'} />
    // 로그인되어 있으면 아웃렛으로 안 되어 있으면 로그인 페이즈로 
  )
}

export default ProtectedRoutes