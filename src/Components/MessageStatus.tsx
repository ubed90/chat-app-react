import React from 'react'
import { MESSAGE_STATUS } from '../models/message.model'
import { BsCheck, BsCheckAll } from 'react-icons/bs'
import { PiClockCounterClockwiseBold } from "react-icons/pi";

const MessageStatus: React.FC<{ status: MESSAGE_STATUS }> = ({ status }) => {
    const messageStatus = {
        SENT: <BsCheck className='text-lg text-gray-400' />,
        DELIVERED: <BsCheckAll className='text-lg text-gray-400' />,
        READ: <BsCheckAll className='text-lg text-cyan-500' />,
        LOADING: <PiClockCounterClockwiseBold className='text-lg text-gray-500' />
    }

    return <span className='absolute right-2 bottom-2'>{messageStatus[status]}</span>;
}

export default MessageStatus