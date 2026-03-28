'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Navbar(){
    const { user, loading, isAuthenticated, logout } = useAuth();

    return (
        <>
            <nav className='fixed h-screen w-1/11 flex justify-center align-center bg-gray-900 flex-col' >
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
                                <Link className='p-2 hover:text-gray-500' href={"/"}>PANEL</Link>
                                <Link className='p-2 hover:text-gray-500' href={"/login"}>KLASY</Link>
                                <Link className='p-2 hover:text-gray-500' href={"/login"}>UTWÓRZ ZADANIE</Link>
                            </>
                        )}

                        {!user?.is_teacher && (
                            <>
                                <h1 className='text-2xl p-2'>Panel ucznia</h1>
                                <Link className='p-2 hover:text-gray-500' href={"/"}>PANEL</Link>
                                <Link className='p-2 hover:text-gray-500' href={"/login"}>ZADANIA</Link>
                                <Link className='p-2 hover:text-gray-500' href={"/login"}>NAUCZYCIELE</Link>
                            </>
                        )}

                        <Link className='p-2 mt-5 hover:text-gray-500' href={"/login"}>WYLOGUJ</Link>
                    </>
                )}

            </nav>
        </>
    )
}