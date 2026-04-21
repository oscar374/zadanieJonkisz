"use client";

import Navbar from "@/components/navbar";
import { useAuth } from '@/hooks/useAuth'; // Added auth import
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClassItem {
    id: number;
    creator_id: number;
    name: string;
    created_at: string;
    color: string;
}

export default function Classes() {
    const { user, loading, isAuthenticated } = useAuth(); // Added auth hook
    const [invitationCode, setInvitationCode] = useState("");
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [feedback, setFeedback] = useState("");
    
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated && !loading) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, router]);

    const handleClassJoin = async () => {
        if (invitationCode === "") {
            setFeedback("Proszę wpisać kod zaproszenia.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/classJoinRequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ invitationCode: invitationCode }),
            });

            if (response.ok) {
                setFeedback("Prośba o dołączenie została wysłana!");
                setInvitationCode("");
            } else if (response.status === 404) {
                setFeedback("Nieprawidłowy kod zaproszenia.");
            } else if (response.status === 409) {
                setFeedback("Już wysłałeś prośbę do tej klasy.");
            } else {
                setFeedback("Wystąpił błąd podczas dołączania.");
            }
        } catch (error) {
            setFeedback("Błąd połączenia z serwerem.");
        }
    };

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
                <div className="h-11/12 w-3/4 bg-gray-900 flex rounded-2xl">
                    <div className="h-full w-1/3 rounded-tl-2xl rounded-bl-2xl bg-gray-700 p-10 flex flex-col">
                        <p className="mb-10 text-2xl text-white">Podaj kod do klasy: </p>
                        
                        <input 
                            value={invitationCode}
                            onChange={(e) => setInvitationCode(e.target.value)}
                            className="text-2xl bg-gray-900 text-white w-full mb-10 text-center p-2 rounded-xl border border-gray-600 focus:outline-none focus:border-gray-400"
                            placeholder="Wpisz kod..."
                        />
                        
                        <button 
                            onClick={handleClassJoin}
                            className="text-2xl w-1/2 p-5 bg-gray-900 text-gray-200 cursor-pointer rounded-2xl hover:bg-gray-800 transition-colors"
                        >
                            Dołącz
                        </button>

                        <div className="mt-5 h-8">
                            {feedback && (
                                <p className="text-gray-300 text-base transition-opacity duration-300">
                                    {feedback}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="h-full w-2/3 rounded-tr-2xl rounded-br-2xl"></div>
                </div>    
            </div>        
        </>
    );
}