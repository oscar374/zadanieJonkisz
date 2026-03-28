"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";

export default function register(){

    const [userType, setUserType] = useState<"nauczyciel" | "uczen">("uczen");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");

    const [feedback, setFeedBack] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== passwordRepeat) {
            setFeedBack("hasła nie sa takie same");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/userRegister", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: firstName,
                    surname: lastName,
                    email: email,
                    password: password,
                    isTeacher: userType === "nauczyciel",
                }),
            });

            if (response.ok) {
                setFeedBack("Pomyślnie zarejestrowano, teraz się zaloguj");
                setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setPasswordRepeat("");
            } else {
                setFeedBack("Takie dane są już w systemie");
            }
        } catch (error) {
            console.error("err:", error);
            setFeedBack("Wystąpił błąd podczas połączenie z serwerem, przepraszmy");
        }
    };
    
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
                <div className={`w-180 h-2/3 bg-gray-800 flex justify-center items-center flex-col border-1 rounded-3xl ${userType === "uczen" ? "border-blue-700" : "border-red-700"}`}>
                    <h1 className="text-2xl">Załóż konto</h1>
                    
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={() => setUserType("uczen")}
                            className={`cursor-pointer rounded-3xl px-4 py-2 ${userType === "uczen" ? "bg-blue-600" : "bg-gray-700"}`}
                        >
                            Uczeń
                        </button>
                        <button
                            onClick={() => setUserType("nauczyciel")}
                            className={`cursor-pointer rounded-3xl px-4 py-2 ${userType === "nauczyciel" ? "bg-red-800" : "bg-gray-700"}`}
                        >
                            Nauczyciel
                        </button>
                        
                    </div>

                    <div className="w-9/12 p-10 bg-gray-900 mt-6 rounded-3xl">
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Imię"
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)}
                                className=" w-1/2 flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600"
                            />
                            <input
                                type="text"
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Nazwisko"
                                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600"
                            />
                        </div>
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
                        <input
                            type="password"
                            value={passwordRepeat} 
                            onChange={(e) => setPasswordRepeat(e.target.value)}
                            placeholder="Powtórz hasło"
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600"
                        />
                    </div>

                    <button 
                        onClick={handleRegister}
                        className={`mt-6 px-6 py-2 bg-gray-900 hover:bg-gray-600 rounded-lg cursor-pointer ${userType === "uczen" ? "text-blue-400" : "text-red-400"}`}
                    >
                        Zarejestruj się
                    </button>
                    {feedback && <p className="mt-4 text-center text-white">{feedback}</p>}
                </div>
            </div>
        </>
    )
}