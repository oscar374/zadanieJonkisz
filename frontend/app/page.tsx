// In any component
'use client';

import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/navbar';

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) return <p>Loading...</p>;
  
  if (!isAuthenticated) return <p>Not logged in</p>;

  return (
    <>
      <Navbar/>
      <div>
        <h1>Welcome, {user?.name} {user?.surname}</h1>
        <p>Email: {user?.email}</p>
        {user?.is_teacher && <p>You are a teacher</p>}
        <button onClick={logout}>Logout</button>
      </div>
    </>
  );
}