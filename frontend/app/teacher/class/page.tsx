"use client";

import Navbar from "@/components/navbar"
import { useEffect, useState } from "react"

export default function classPage(){

    const [className, setClassName] = useState("");
    const [invitationCode, setInvitationCode] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const classId = sessionStorage.getItem("class");

            const response = await fetch(`http://localhost:8000/api/fetchClass?classId=${classId}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
                credentials: 'include'
            })

            if(response.ok){
                const data = await response.json();
                if (data && data.length > 0) {
                    setClassName(data[0].name);
                    setInvitationCode(data[0].invitationcode);
                }
            }
        }

        fetchData();
    }, [])
        
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
                <div className="h-11/12 w-3/4 bg-gray-900 flex rounded-2xl">
                    <div className="w-1/4 h-full bg-gray-700 rounded-tl-2xl rounded-bl-2xl flex justify-center items-center flex-col">
                        <div className="h-1/2 w-full flex justify-center items-center flex-col">
                            <h1 className="text-white text-6xl">{className}</h1> <br></br>
                        </div>
                        <div className="h-1/2 w-full bg-gray-800 flex justify-center items-center flex-col gap-2">
                            <p className="text-1xl">kod do dołączenia: </p>
                            <p className="bg-gray-700 p-10 rounded-2xl text-1xl">{invitationCode}</p>
                        </div>
                    </div>
                    <div className="w-3/4 h-full bg-gray-900 rounded-tr-2xl rounded-br-2xl p-10">
                        <h1 className="text-white text-2xl">Uczniowie:</h1> <br></br>
                    </div>
                </div>
            </div>
        </>
    )
}