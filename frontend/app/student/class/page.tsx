"use client";

import Navbar from "@/components/navbar"
import { useEffect, useState } from "react"

interface Task {
    id: number
    title: string
    description: string
    created_at: string
}

interface Submission {
    id: number
    task_id: number
    content: string
    grade: string | null
    created_at: string
}

export default function StudentClassPage() {

    const [className, setClassName] = useState("")
    const [tasks, setTasks] = useState<Task[]>([])
    const [submissions, setSubmissions] = useState<Record<number, Submission>>({})
    const [loading, setLoading] = useState(true)

    const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null)
    const [submissionContent, setSubmissionContent] = useState("")

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

    const loadInitialData = async () => {
        setLoading(true)
        const id = getStoredClassId()
        if (!id) {
            setLoading(false)
            return
        }

        const classDataReq = fetchJson(`http://localhost:8000/api/fetchClass?classId=${id}`)
        const tasksReq = fetchJson(`http://localhost:8000/api/getTasks?classId=${id}`)
        const subsReq = fetchJson(`http://localhost:8000/api/getStudentSubmissions?classId=${id}`)

        const [classData, tasksData, subsData] = await Promise.all([classDataReq, tasksReq, subsReq])

        if (classData && classData.length > 0) {
            setClassName(classData[0].name)
        }

        if (tasksData) {
            setTasks(tasksData.tasks)
        }

        if (subsData) {
            const subsMap: Record<number, Submission> = {}
            for (const sub of subsData.submissions) {
                subsMap[sub.task_id] = sub
            }
            setSubmissions(subsMap)
        }

        setLoading(false)
    }

    const handleSubmitTask = async (taskId: number) => {
        if (!submissionContent) return
        const response = await fetch(`http://localhost:8000/api/submitTask`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                taskId: taskId,
                content: submissionContent
            })
        })

        if (response.ok) {
            setSubmissionContent("")
            const id = getStoredClassId()
            if (id) {
                const subsData = await fetchJson(`http://localhost:8000/api/getStudentSubmissions?classId=${id}`)
                if (subsData) {
                    const subsMap: Record<number, Submission> = {}
                    for (const sub of subsData.submissions) {
                        subsMap[sub.task_id] = sub
                    }
                    setSubmissions(subsMap)
                }
            }
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
                        <div className="h-full w-full flex justify-center items-center flex-col text-center p-4">
                            <h1 className="text-white text-5xl break-words">{className}</h1>
                        </div>
                    </div>

                    <div className="w-4/5 h-full bg-gray-900 rounded-tr-2xl rounded-br-2xl p-10 overflow-y-auto flex flex-col gap-6">
                        <h1 className="text-white text-3xl">Zadania</h1>
                        
                        <div className="flex flex-col gap-4">
                            {tasks.map(task => {
                                const sub = submissions[task.id]
                                return (
                                    <div key={task.id} className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                                        <div className="flex justify-between items-center cursor-pointer" onClick={() => {
                                            if (expandedTaskId === task.id) setExpandedTaskId(null)
                                            else { setExpandedTaskId(task.id); setSubmissionContent(""); }
                                        }}>
                                            <h2 className="text-xl text-white font-semibold">{task.title}</h2>
                                            <div className="flex items-center gap-4">
                                                {sub ? (
                                                    sub.grade ? (
                                                        <span className="text-green-400 bg-gray-900 px-3 py-1 rounded-2xl text-sm">Ocena: {sub.grade}</span>
                                                    ) : (
                                                        <span className="text-yellow-400 bg-gray-900 px-3 py-1 rounded-2xl text-sm">Przesłano</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400 bg-gray-900 px-3 py-1 rounded-2xl text-sm">Brak rozwiązania</span>
                                                )}
                                                <span className="text-gray-400 text-sm">{new Date(task.created_at).toLocaleDateString("pl-PL")}</span>
                                            </div>
                                        </div>
                                        
                                        {expandedTaskId === task.id && (
                                            <>
                                                <p className="text-gray-300 text-sm">{task.description}</p>
                                                <div className="mt-4 flex flex-col gap-3">
                                                    {sub ? (
                                                        <div className="bg-gray-900 p-4 rounded-2xl flex flex-col gap-3">
                                                            <h3 className="text-white text-sm font-semibold">Twoje rozwiązanie:</h3>
                                                            <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded-2xl">{sub.content}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-900 p-4 rounded-2xl flex flex-col gap-3">
                                                            <textarea 
                                                                className="bg-gray-800 text-white rounded-2xl p-3 focus:outline-none min-h-24 resize-none text-sm" 
                                                                placeholder="Wpisz swoje rozwiązanie" 
                                                                value={submissionContent} 
                                                                onChange={e => setSubmissionContent(e.target.value)} 
                                                            />
                                                            <button className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-500 transition-colors text-sm self-start" onClick={() => handleSubmitTask(task.id)}>Wyślij rozwiązanie</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                            
                            {!loading && tasks.length === 0 && (
                                <p className="text-gray-500 italic">Brak zadań w tej klasie.</p>
                            )}
                            
                            {loading && (
                                <p className="text-gray-400 italic">Ładowanie...</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
