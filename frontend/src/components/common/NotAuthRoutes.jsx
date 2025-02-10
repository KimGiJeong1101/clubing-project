import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const NotAuthRoutes = ({ isAuth }) => {
  console.log("isAuth:", isAuth);  
  return (
    isAuth ? <Navigate to={'/'} /> : <Outlet />
  );
};


export default NotAuthRoutes