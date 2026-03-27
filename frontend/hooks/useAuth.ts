'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    isTeacher: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    logout: () => void;
    refetch: () => Promise<void>;
}

export function useAuth(): AuthContextType {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchAuth = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', 
            });

            if (!response.ok) {
                throw new Error('Not authenticated');
            }

            const data = await response.json();
            setUser(data.user);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuth();
    }, [fetchAuth]);

    const logout = useCallback(async () => {
        await fetch('http://localhost:8000/api/auth/logout', { 
            method: 'POST', 
            credentials: 'include' 
        });

        setUser(null);
        router.push('/login');
    }, [router]);

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        logout,
        refetch: fetchAuth,
    };
}