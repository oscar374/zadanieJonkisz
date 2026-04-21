"use client";

import Navbar from "@/components/navbar";
import { useAuth } from '@/hooks/useAuth';
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
    const { user, loading, isAuthenticated } = useAuth();
    const [invitationCode, setInvitationCode] = useState("");
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [feedback, setFeedback] = useState("");
    
    const router = useRouter();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/getClassesStudent", {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setClasses(data);
                }
            } catch (error) {
                console.error("Failed to fetch classes:", error);
            }
        };

        if (isAuthenticated) {
            fetchClasses();
        }
    }, [isAuthenticated]);

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
                headers: { "Content-Type": "application/json" },
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

    const handleClassClick = (id: number) => {
        sessionStorage.setItem("class", id.toString());
        router.push("/student/class");
    };

    if (loading || !isAuthenticated) return <p className="text-white">Loading...</p>;

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
                <div className="h-11/12 w-3/4 bg-gray-900 flex rounded-2xl overflow-hidden">
                    <div className="h-full w-1/3 bg-gray-800 p-10 flex flex-col border-r border-gray-700">
                        <p className="mb-10 text-2xl text-white">Dołącz do klasy</p>
                        
                        <input 
                            value={invitationCode}
                            onChange={(e) => setInvitationCode(e.target.value)}
                            className="text-xl bg-gray-900 text-white w-full mb-6 text-center p-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="kod zaproszenia"
                        />
                        
                        <button 
                            onClick={handleClassJoin}
                            className="text-xl w-full p-4 bg-gray-700 text-white cursor-pointer rounded-2xl transition-colors shadow-lg"
                        >
                            Wyślij prośbę
                        </button>

                        <div className="mt-5 h-8">
                            {feedback && (
                                <p className="text-gray-300 text-sm italic">
                                    {feedback}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="h-full w-2/3 p-10 overflow-y-auto">
                        <p className="mb-8 text-2xl text-white font-semibold">Klasy do których należysz</p>
                        
                        <div className="flex flex-wrap gap-6">
                            {classes.length > 0 ? (
                                classes.map((classItem) => (
                                    <div 
                                        key={classItem.id} 
                                        onClick={() => handleClassClick(classItem.id)}
                                        className="w-32 h-32 flex flex-col justify-center items-center rounded-2xl cursor-pointer transition-transform shadow-lg group relative"
                                        style={{ backgroundColor: classItem.color }}
                                    >
                                        <span className="text-white text-xl font-bold text-center px-2 drop-shadow-md">
                                            {classItem.name}
                                        </span>
                                        <div className="absolute inset-0 bg-black opacity-0 rounded-2xl transition-opacity"></div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full flex flex-col items-center justify-center mt-10 text-gray-500">
                                    <p className="text-xl">Nie ma cie w zadnej klasie</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>    
            </div>        
        </>
    );
}