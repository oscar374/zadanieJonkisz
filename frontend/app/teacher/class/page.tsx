"use client";

import Navbar from "@/components/navbar"
import { useEffect, useId, useState } from "react"

interface Invitation {
    user_id: number;
    name: string;
    surname: string;
    email: string;
    request_id: number;
}

export default function ClassPage() {
    const [className, setClassName] = useState("");
    const [classId, setClassId] = useState("");
    const [invitationCode, setInvitationCode] = useState("");
    const [invitations, setInvitations] = useState<Invitation[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const classId = sessionStorage.getItem("class");
            if (!classId) return;

            const response = await fetch(`http://localhost:8000/api/fetchClass?classId=${classId}`, {
                method: "GET",
                headers: { "Accept": "application/json" },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setClassName(data[0].name);
                    setClassId(data[0].id);
                    setInvitationCode(data[0].invitationcode);
                }
            }

            const invResponse = await fetch(`http://localhost:8000/api/fetchInvitations?classId=${classId}`, {
                method: "GET",
                headers: { "Accept": "application/json" },
                credentials: 'include'
            });

            if (invResponse.ok) {
                const data = await invResponse.json();               
                setInvitations(data.invitations);      
            }
        }

        fetchData();
    }, []);

    const handleJoinResponse = (classId: string, userId: number, accept: boolean) => {
        console.log(classId + " - " + userId + " - " + accept);

        const callApi = async () => {
            const response = await fetch('http://localhost:8000/api/joinResponse', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    classId: classId,
                    userId: userId,
                    accept: accept
                })
            });
        }

        callApi();
    }

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
                    <div className="w-1/5 h-full bg-gray-700 rounded-tl-2xl rounded-bl-2xl flex justify-center items-center flex-col">
                        <div className="h-1/2 w-full flex justify-center items-center flex-col text-center p-4">
                            <h1 className="text-white text-5xl break-words">{className}</h1>
                        </div>
                        <div className="h-1/2 w-full bg-gray-800 flex justify-center items-center flex-col gap-2">
                            <p className="text-1xl">kod do dołączenia: </p>
                            <p className="bg-gray-700 p-3 rounded-2xl text-1xl font-mono">{invitationCode}</p>
                        </div>
                    </div>
                    <div className="w-4/5 h-full bg-gray-900 rounded-tr-2xl rounded-br-2xl flex flex-col">
                        <div className="w-full h-2/3 p-10 overflow-y-auto">
                            <h1 className="text-white text-2xl">Uczniowie:</h1> 
                            <br />
                        </div>
                        <div className="w-full h-1/3 bg-gray-950 p-10 overflow-y-auto border-t border-gray-800">
                            <h1 className="text-white text-2xl">Prośby o dołączenie do klasy:</h1> 
                            <br />
                            <div className="    ">
                                {invitations.length > 0 ? (
                                    invitations.map((inv) => (
                                        <div key={inv.request_id} className="w-3/12 inline-flex justify-between items-center bg-gray-900 p-4 rounded-xl mr-5 mb-5">
                                            <div className="flex">
                                                <p className="text-white font-semibold mr-4 text-xs">{inv.name} {inv.surname}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleJoinResponse(classId, inv.user_id, true)} className="bg-green-700 text-xs hover:bg-green-600 text-white px-4 py-2 aspect-square rounded-full transition-colors">✅</button>
                                                <button onClick={() => handleJoinResponse(classId, inv.user_id, false)} className="bg-red-800 text-xs hover:bg-red-700 text-white px-4 py-2 rounded-full aspect-square transition-colors">❌</button>
                                            </div>
                                        </div>                             
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Brak oczekujących próśb.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}