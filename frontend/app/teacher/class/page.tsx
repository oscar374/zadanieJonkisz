"use client";

import Navbar from "@/components/navbar"
import { useEffect, useState } from "react"

interface Invitation {
    user_id: number
    name: string
    surname: string
    email: string
    request_id: number
}

interface Student {
    user_id: number
    name: string
    surname: string
    email: string
    created_at: string
}

export default function ClassPage() {

    const [className, setClassName] = useState("")
    const [classId, setClassId] = useState("")
    const [invitationCode, setInvitationCode] = useState("")
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)

    const getStoredClassId = () => sessionStorage.getItem("class")

    const fetchJson = async (url: string, options: RequestInit = {}) => {
        const response = await fetch(url, {
            credentials: "include",
            headers: { Accept: "application/json" },
            ...options
        })
        if (!response.ok) return null
        return response.json()
    }

    const fetchClassData = async (id: string) => {
        const data = await fetchJson(`http://localhost:8000/api/fetchClass?classId=${id}`)
        if (data && data.length > 0) {
            setClassName(data[0].name)
            setClassId(data[0].id)
            setInvitationCode(data[0].invitationcode)
        }
    }

    const fetchInvitations = async (id: string) => {
        const data = await fetchJson(`http://localhost:8000/api/fetchInvitations?classId=${id}`)
        if (data) setInvitations(data.invitations)
    }

    const fetchStudents = async (id: string) => {
        const data = await fetchJson(`http://localhost:8000/api/fetchStudents?classId=${id}`)
        if (data) setStudents(data.students)
    }

    const loadInitialData = async () => {
        setLoading(true)

        const id = getStoredClassId()
        if (!id) {
            setLoading(false)
            return
        }

        await Promise.all([
            fetchClassData(id),
            fetchInvitations(id),
            fetchStudents(id)
        ])

        setLoading(false)
    }

    const refreshInvitations = async () => {
        const id = getStoredClassId()
        if (id) await fetchInvitations(id)
    }

    const refreshStudents = async () => {
        const id = getStoredClassId()
        if (id) await fetchStudents(id)
    }

    const handleJoinResponse = async (requestId: Number, classIdNum: string, userId: number, accept: boolean) => {
        const response = await fetch(`http://localhost:8000/api/joinResponse`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                requestId,
                classId: parseInt(classIdNum),
                userId,
                accept
            })
        })

        if (response.ok) {
            await refreshInvitations()
            if (accept) await refreshStudents()
        }
    }

    useEffect(() => {
        loadInitialData()
    }, [])

    return (
        <>
            <Navbar />
            <div
                className="w-full h-screen flex justify-center items-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1515268064940-5150b7c29f35?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.0.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91bnRhaW4lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww")',
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
                            <p className="text-1xl">kod do dołączenia:</p>
                            <p className="bg-gray-700 p-3 rounded-2xl text-1xl font-mono">{invitationCode}</p>
                        </div>
                    </div>

                    <div className="w-4/5 h-full bg-gray-900 rounded-tr-2xl rounded-br-2xl flex flex-col">

                        <div className="w-full h-2/3 p-10 overflow-y-auto">
                            <h1 className="text-white text-2xl">Uczniowie:</h1>
                            <br />

                            <div className="space-y-3">
                                {loading ? (
                                    <p className="text-gray-400 italic">Ładowanie...</p>
                                ) : students.length > 0 ? (
                                    students.map((student) => (
                                        <div key={student.user_id} className="bg-gray-800 p-1 rounded-lg flex justify-between items-center">
                                            <div className="flex">
                                                <p className="text-white font-semibold font-xs mr-5 ml-5">{student.name} {student.surname}</p>
                                                <p className="text-gray-400 text-sm font-xs">{student.email}</p>
                                            </div>
                                            <p className="text-gray-500 text-xs">
                                                Dołączył: {new Date(student.created_at).toLocaleDateString("pl-PL")}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Brak uczniów w klasie.</p>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-1/3 bg-gray-950 p-10 overflow-y-auto border-t border-gray-800">
                            <h1 className="text-white text-xl">Prośby o dołączenie</h1>
                            <br />

                            <div className="space-y-3">
                                {invitations.length > 0 ? (
                                    invitations.map((inv) => (
                                        <div key={inv.request_id} className="w-3/12 inline-flex justify-between items-center bg-gray-900 p-4 rounded-xl">
                                            <div className="flex">
                                                <p className="text-white font-semibold text-xs">{inv.name} {inv.surname}</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={() => handleJoinResponse(inv.request_id, classId, inv.user_id, true)} className="bg-green-700 text-xs aspect-square hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors">✅</button>
                                                <button onClick={() => handleJoinResponse(inv.request_id, classId, inv.user_id, false)}  className="bg-red-800 text-xs aspect-square hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors">❌</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">brak</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}