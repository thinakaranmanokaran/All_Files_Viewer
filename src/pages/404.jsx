import React from 'react'
import { Link } from 'react-router-dom'

const Page404 = () => {
    return (
        <div className=' h-screen w-screen flex flex-col  items-center justify-center'>
            <div className='text-8xl text-light font-inter font-light tracking-tight'>404 Found</div>
            <Link to="/" className='bg-light px-8 py-4 text-2xl mt-8 font-inter cursor-pointer hover:scale-105 transition-all duration-300 '>Go Back</Link>
        </div>
    )
}

export default Page404