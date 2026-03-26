"use client";

import { useState } from "react";

export default function login(){
    return (
        <>
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
                            placeholder="Email"
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600 mb-4"
                        />
                        <input
                            type="password"
                            placeholder="Hasło"
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600 mb-4"
                        />
                    </div>

                    <button className={`mt-6 px-6 py-2 bg-gray-900 hover:bg-gray-600 rounded-lg cursor-pointer text-white`}>
                        Zaloguj
                    </button>
                </div>
            </div>
        </>
    )
}