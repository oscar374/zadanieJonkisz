"use client";

import Navbar from "@/components/navbar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";

interface ClassItem{
    id: number;
    creator_id: number;
    name: string;
    created_at: string;
    color: string;
}

export default function classes(){
    const [className, setClassName] = useState("");
    const [feedback, setFeedBack] = useState("");

    const [classes, setClasses] = useState<ClassItem[]>([]);

    const router = useRouter();

    const [colors, setColors] = useState([
        "#FFADAD", 
        "#A0C4FF",
        "#FDFFB6",
        "#CAFFBF",
        "#BDB2FF" 
    ]);
    const [selectedColor, setSelectedColor] = useState("#FFADAD");

    useEffect(() => {
        fetchClasses();
    }, [])
    
    const fetchClasses = async () => {
        const fetchData = async () => {
            const response = await fetch("http://localhost:8000/api/getClasses", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
            })

            if(response.ok){
                const data = await response.json();
                setClasses(data);
            }
        }
        fetchData();
        console.log(classes);
    }

    const CreateClassHandle = () => {
        
        if(className.length >= 5){
            setFeedBack("nazwa klady nie może przegraczać 5 znaków");
            return;
        }

        const fetchResponse = async () => {
            const response = await fetch("http://localhost:8000/api/addClass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: className,
                    color: selectedColor
                }),
                credentials: 'include',
            })

            if(response.ok){
                const data = await response.json();
                setFeedBack("pomyślnie utworzono klase " + className);
                fetchClasses();
            } else {
                setFeedBack("coś poszło nie tak");
            }
        }

        fetchResponse();
    }

    const ClassClick = (name: string, id: string) => {
        sessionStorage.setItem("class", id);
        router.push("/teacher/class");
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
                <div className="h-11/12 w-3/4 bg-gray-900 flex rounded-2xl">
                    <div className="w-4/5 h-full">
                        <div className="">
                            {classes.length > 0 ? (
                                classes.map((classItem) => {
                                    return (
                                        <div key={classItem.id} className="w-1/12 aspect-square flex justify-center items-center inline-block mr-5 user-sel select-none" >
                                            <div className="flex justify-center items-center m-5 border-1 rounded-2xl w-full h-full text-2xl text-shadow-lg/30 cursor-pointer" style={{backgroundColor: classItem.color}} onClick={() => ClassClick(classItem.name, classItem.id)}>
                                                {classItem.name}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <>
                                    <p>nie masz jeszcze żadnej klasy ( dodaj je po prawej )</p>
                                </>
                            )}
                        </div>

                    </div>
                    <div className="w-1/5 h-full bg-gray-700 p-10">
                        <input
                            type="text"
                            value={className} 
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="Nazwa klasy"
                            className="flex-1 bg-gray-900 rounded-lg px-4 py-2 mt-10 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600"
                        />  

                        <br></br>
                        
                        <p className="mt-5">kolor klasy</p>
                        <select className="w-full h-10" style={{backgroundColor: selectedColor}} value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                            {colors.map((color) => {
                                return (
                                    <option key={color} className="w-full h-10" style={{backgroundColor: color}} value={color}>
                                        
                                    </option>
                                )
                            })}
                        </select>

                        <br></br>
                    
                        <button className="p-5 bg-gray-600 cursor-pointer mt-10 rounded-lg" onClick={CreateClassHandle}>Dodaj Klase</button>       
                        <p className="text-blue-300 mt-5">{feedback}</p>
                    </div>
                </div>
                
            </div>
        </>
    )
}