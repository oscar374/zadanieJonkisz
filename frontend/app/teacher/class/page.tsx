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

interface Task {
    id: number
    title: string
    description: string
    created_at: string
}

interface Submission {
    id: number
    task_id: number
    student_id: number
    content: string
    grade: string | null
    created_at: string
    name: string
    surname: string
}

export default function ClassPage() {

    const [className, setClassName] = useState("")
    const [classId, setClassId] = useState("")
    const [invitationCode, setInvitationCode] = useState("")
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [submissions, setSubmissions] = useState<Record<number, Submission[]>>({})
    const [loading, setLoading] = useState(true)

    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskDesc, setNewTaskDesc] = useState("")
    const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
    const [gradingSubmissionId, setGradingSubmissionId] = useState<number | null>(null)
    const [gradeInput, setGradeInput] = useState("")

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

    const fetchTasks = async (id: string) => {
        const data = await fetchJson(`http://localhost:8000/api/getTasks?classId=${id}`)
        if (data) setTasks(data.tasks)
    }

    const fetchSubmissions = async (taskId: number) => {
        const data = await fetchJson(`http://localhost:8000/api/getSubmissions?taskId=${taskId}`)
        if (data) {
            setSubmissions(prev => ({ ...prev, [taskId]: data.submissions }))
        }
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
            fetchStudents(id),
            fetchTasks(id)
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

    const handleAddTask = async () => {
        if (!newTaskTitle || !newTaskDesc) return
        const response = await fetch(`http://localhost:8000/api/addTask`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                classId: parseInt(classId),
                title: newTaskTitle,
                description: newTaskDesc
            })
        })
        if (response.ok) {
            setNewTaskTitle("")
            setNewTaskDesc("")
            await fetchTasks(classId)
        }
    }

    const toggleTask = (taskId: number) => {
        if (expandedTaskId === taskId) {
            setExpandedTaskId(null)
        } else {
            setExpandedTaskId(taskId)
            fetchSubmissions(taskId)
        }
    }

    const handleMarkSubmission = async (submissionId: number, taskId: number) => {
        if (!gradeInput) return
        const response = await fetch(`http://localhost:8000/api/markSubmission`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                submissionId: submissionId,
                grade: gradeInput
            })
        })
        if (response.ok) {
            setGradingSubmissionId(null)
            setGradeInput("")
            await fetchSubmissions(taskId)
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
                        <div className="h-1/2 w-full bg-gray-800 flex justify-center items-center flex-col gap-2 rounded-bl-2xl">
                            <p className="text-1xl text-gray-300">kod do dołączenia:</p>
                            <p className="bg-gray-700 p-3 rounded-2xl text-1xl font-mono text-white">{invitationCode}</p>
                        </div>
                    </div>

                    <div className="w-4/5 h-full bg-gray-900 rounded-tr-2xl rounded-br-2xl flex flex-row">

                        <div className="w-1/2 h-full flex flex-col border-r-0">
                            <div className="w-full h-2/3 p-10 overflow-y-auto">
                                <h1 className="text-white text-2xl mb-6">Uczniowie:</h1>
                                <div className="space-y-3">
                                    {loading ? (
                                        <p className="text-gray-400 italic">Ładowanie...</p>
                                    ) : students.length > 0 ? (
                                        students.map((student) => (
                                            <div key={student.user_id} className="bg-gray-800 p-3 rounded-2xl flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <p className="text-white font-semibold text-sm">{student.name} {student.surname}</p>
                                                    <p className="text-gray-400 text-xs">{student.email}</p>
                                                </div>
                                                <p className="text-gray-500 text-xs">
                                                    {new Date(student.created_at).toLocaleDateString("pl-PL")}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">Brak uczniów w klasie.</p>
                                    )}
                                </div>
                            </div>

                            <div className="w-full h-1/3 bg-gray-950 p-10 overflow-y-auto">
                                <h1 className="text-white text-xl mb-4">Prośby o dołączenie</h1>
                                <div className="space-y-3">
                                    {invitations.length > 0 ? (
                                        invitations.map((inv) => (
                                            <div key={inv.request_id} className="w-full flex justify-between items-center bg-gray-900 p-3 rounded-2xl">
                                                <p className="text-white font-semibold text-sm">{inv.name} {inv.surname}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleJoinResponse(inv.request_id, classId, inv.user_id, true)} className="bg-green-700 text-xs aspect-square hover:bg-green-600 text-white px-3 py-2 rounded-2xl transition-colors">✅</button>
                                                    <button onClick={() => handleJoinResponse(inv.request_id, classId, inv.user_id, false)} className="bg-red-800 text-xs aspect-square hover:bg-red-700 text-white px-3 py-2 rounded-2xl transition-colors">❌</button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">brak</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 h-full bg-gray-800 rounded-br-2xl rounded-tr-2xl p-10 overflow-y-auto flex flex-col gap-6">
                            <h1 className="text-white text-2xl">Zadania</h1>
                            <div className="bg-gray-900 p-6 rounded-2xl flex flex-col gap-4">
                                <input 
                                    className="bg-gray-800 text-white rounded-2xl p-3 focus:outline-none" 
                                    placeholder="Tytuł zadania" 
                                    value={newTaskTitle} 
                                    onChange={e => setNewTaskTitle(e.target.value)} 
                                />
                                <textarea 
                                    className="bg-gray-800 text-white rounded-2xl p-3 focus:outline-none min-h-24 resize-none" 
                                    placeholder="Opis zadania" 
                                    value={newTaskDesc} 
                                    onChange={e => setNewTaskDesc(e.target.value)} 
                                />
                                <button className="bg-gray-700 text-white p-3 rounded-2xl hover:bg-gray-600 transition-colors" onClick={handleAddTask}>Dodaj Zadanie</button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {tasks.map(task => (
                                    <div key={task.id} className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">
                                        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleTask(task.id)}>
                                            <h2 className="text-xl text-white font-semibold">{task.title}</h2>
                                            <span className="text-gray-400 text-sm">{new Date(task.created_at).toLocaleDateString("pl-PL")}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{task.description}</p>
                                        
                                        {expandedTaskId === task.id && (
                                            <div className="mt-4 flex flex-col gap-3">
                                                <h3 className="text-white text-lg">Przesłane rozwiązania:</h3>
                                                {(submissions[task.id] || []).map(sub => (
                                                    <div key={sub.id} className="bg-gray-800 p-4 rounded-2xl flex flex-col gap-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white text-sm font-semibold">{sub.name} {sub.surname}</span>
                                                            {sub.grade ? (
                                                                <span className="text-green-400 text-sm bg-gray-900 px-3 py-1 rounded-2xl">Ocena: {sub.grade}</span>
                                                            ) : (
                                                                <span className="text-yellow-400 text-sm bg-gray-900 px-3 py-1 rounded-2xl">Nieocenione</span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-300 bg-gray-900 p-3 rounded-2xl text-sm">{sub.content}</p>
                                                        
                                                        {gradingSubmissionId === sub.id ? (
                                                            <div className="flex gap-2">
                                                                <input className="bg-gray-900 text-white p-2 rounded-2xl flex-1 focus:outline-none text-sm" placeholder="Wpisz ocenę" value={gradeInput} onChange={e => setGradeInput(e.target.value)} />
                                                                <button className="bg-green-700 text-white px-4 rounded-2xl hover:bg-green-600 text-sm transition-colors" onClick={() => handleMarkSubmission(sub.id, task.id)}>Zapisz</button>
                                                                <button className="bg-gray-700 text-white px-4 rounded-2xl hover:bg-gray-600 text-sm transition-colors" onClick={() => { setGradingSubmissionId(null); setGradeInput(""); }}>Anuluj</button>
                                                            </div>
                                                        ) : (
                                                            !sub.grade && (
                                                                <button className="bg-gray-700 text-white p-2 rounded-2xl self-start hover:bg-gray-600 text-sm transition-colors" onClick={() => setGradingSubmissionId(sub.id)}>Oceń</button>
                                                            )
                                                        )}
                                                    </div>
                                                ))}
                                                {(submissions[task.id] || []).length === 0 && (
                                                    <p className="text-gray-500 italic text-sm">Brak rozwiązań.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}