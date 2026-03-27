'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Navbar(){
    const { user, loading, isAuthenticated, logout } = useAuth();

    return (
        <>
            <nav className='fixed w-screen h-40 flex justify-center align-center'>
                <Link href={"/register"}></Link>
                <Link href={"/login"}></Link>
            </nav>
        </>
    )
}