import React from 'react'
import { getInitials } from '../utils/helper'

export const Profileinfo = ({userInfo ,onLogout}) => {
  return (
    <div className='flex items-center gap-3'>
        <div className='w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
            {getInitials(userInfo?.fulName)}
        </div>
        <div className=''>
            <p className='text-sm font-medium'>{userInfo?.fulName}</p>
            <button className='text-sm text-slate-700 underline' onClick={onLogout}> Logout</button>
        </div>
    </div>
  )
}
