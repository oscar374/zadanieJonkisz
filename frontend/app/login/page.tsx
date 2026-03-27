"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { useAuth } from '@/hooks/useAuth';

export default function login(){
    const { user, loading, isAuthenticated, logout } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [feedback, setFeedBack] = useState("");

    const router = useRouter();

    if(isAuthenticated) router.push("/");
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try{
            const response = await fetch("http://localhost:8000/api/userLogin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
                credentials: 'include'
            });

            if (response.ok) {
                setFeedBack("Pomyślnie zalogowano");
                setEmail(""); setPassword("");
                router.push("/");
            } else {
                setFeedBack("Wystąpił błąd podczas logowania: " + response.statusText);
            }

        } catch (error) {
            console.error("err: ", error);
            setFeedBack("Wystąpił błąd podczas połączenie z serwerem, przepraszmy");
        }
    }

    return (
        <>
            <Navbar/>
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
                <div className={`w-1/3 h-2/3 bg-gray-800 flex justify-center items-center flex-col border-1 rounded-3xl border-gray-300`}>
                    <h1 className="text-2xl">Zaloguj się</h1>           

                    <div className="w-9/12 p-10 bg-gray-900 mt-6 rounded-3xl">
                        <input
                            type="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600 mb-4"
                        />
                        <input
                            type="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Hasło"
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600 mb-4"
                        />
                    </div>

                    <button 
                        onClick={handleLogin}
                        className={`mt-6 px-6 py-2 bg-gray-900 hover:bg-gray-600 rounded-lg cursor-pointer text-white`}
                    >
                        Zaloguj
                    </button>
                    {feedback && <p className="mt-4 text-center text-white">{feedback}</p>}
                </div>
            </div>
        </>
    )
}