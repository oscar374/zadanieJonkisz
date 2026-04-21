'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar(){
    const { user, loading, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className='fixed top-4 left-4 z-50 p-3 bg-gray-900 text-white rounded cursor-pointer'
            >
                ☰
            </button>

            <nav className={`fixed h-screen border-r-2 border-blue-200 w-1/11 flex justify-center align-center bg-gray-900 flex-col transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} >
                {!isAuthenticated && !loading && (
                    <>
                        <Link className='p-2 hover:text-gray-500' href={"/register"}>REGISTER</Link>
                        <Link className='p-2 hover:text-gray-500' href={"/login"}>LOGIN</Link>
                    </>
                )}

                {isAuthenticated && !loading && (
                    <>  
                        {user?.is_teacher && (
                            <>
                                <h1 className='text-2xl p-2 mb-5'>Panel nauczyciela</h1>
                                <Link className='p-2 hover:text-gray-500' href={"/"}>PANEL GŁÓWNY</Link>
                                <Link className='p-2 hover:text-gray-500' href={"/teacher/classes"}>KLASY</Link>
                            </>
                        )}

                        {!user?.is_teacher && (
                            <>
                                <h1 className='text-2xl p-2'>Panel ucznia</h1>
                                <Link className='p-2 hover:text-gray-500' href={"/"}>PANEL</Link>
                                <Link className='p-2 hover:text-gray-500' href={"/student/classes"}>TWOJE KLASY</Link>
                            </>
                        )}

                        <Link className='p-2 mt-5 hover:text-gray-500' href={"/login"}>WYLOGUJ</Link>
                    </>
                )}

            </nav>
        </>
    )
}