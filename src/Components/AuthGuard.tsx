// ! Auth Guard responsible to check whether the user is logged in or not to access private pages

import React, { PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../Store'
import { Navigate } from 'react-router-dom'

const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
    const { user } = useSelector((state: RootState) => state.user)

    if(!user) {
        return <Navigate to='/' replace />
    }

  return <>
    {children}
  </>
}

export default AuthGuard