'use client';

import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/navbar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) return <p>Loading...</p>;

    return (
        <>
            <Navbar />
            <div
                className="w-full h-screen flex justify-center items-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1515268064940-5150b7c29f35?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91bnRhaW4lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backgroundBlendMode: 'darken'
                }}
            >
                <div className="w-2/3 h-3/4 bg-gray-800 flex justify-center items-center flex-col border-1 rounded-3xl border-gray-400">
                    <h1>Welcome, {user?.name} {user?.surname}</h1>
                    <p>Email: {user?.email}</p>
                    {user?.is_teacher && <p>You are a teacher</p>}
                    <button onClick={logout}>Logout</button>
                </div>
            </div>
        </>
    );
}