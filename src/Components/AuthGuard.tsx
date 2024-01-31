import React, { PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../Store'
import { Navigate } from 'react-router-dom'

const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
    const { user } = useSelector((state: RootState) => state.user)

    if(!user) {
        // toast.warning('Session expired. Please login again')
        return <Navigate to='/login' replace />
    }

  return <>
    {children}
  </>
}

export default AuthGuard