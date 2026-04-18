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
            <div className="w-3/4 mx-auto h-11/12">
            {/* Profile Header Card */}
            <div className="bg-gray-900 rounded-3xl p-6 mb-6">
                <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-900 font-bold text-xl flex-shrink-0">
                    {user?.name?.charAt(0)}{user?.surname?.charAt(0)}
                    </div>
                    <div>
                    <h1 className="text-2xl text-white">
                        Witaj, {user?.name} {user?.surname}
                    </h1>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg text-gray-200 hover:bg-gray-700 transition-colors"
                >
                    Logout
                </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-3xl p-5">
                <h2 className="text-lg text-white mb-4">informacje o koncie</h2>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                <p className="text-gray-200">{user?.email}</p>
                </div>

                <div className="bg-gray-900 rounded-3xl 0 p-5">
                <h2 className="text-lg text-white mb-4">Typ konta</h2>
                {user?.is_teacher ? (
                    <span className="inline-block px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium">
                    Nauczyciel
                    </span>
                ) : (
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    Uczeń
                    </span>
                )}
                </div>
            </div>
            </div>
            </div>
        </>
    );
}