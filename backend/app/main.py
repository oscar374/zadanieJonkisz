from fastapi import FastAPI, Response, Cookie, HTTPException, Query
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
import bcrypt
import secrets
import string
import random
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

#-------------------------------------------- database setup
def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "mydb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "PASS"),
        cursor_factory=psycopg2.extras.RealDictCursor
    )

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_teacher BOOLEAN DEFAULT FALSE
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            auth_key TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,  -- stores userId + authKey
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS classes (
            id SERIAL PRIMARY KEY,
            creator_id INTEGER NOT NULL REFERENCES users(id),
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            invitationCode TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS studentToClass (
            id SERIAL PRIMARY KEY,
            class_id INTEGER NOT NULL REFERENCES classes(id),
            student_id INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS studentInvitation (
            id SERIAL PRIMARY KEY,
            class_id INTEGER NOT NULL REFERENCES classes(id),
            student_id INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS joinRequest (
            id SERIAL PRIMARY KEY,
            class_id INTEGER NOT NULL REFERENCES classes(id),
            student_id INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cur.close()
    conn.close()

init_db()
#-------------------------------------------- database setup

class AuthRequest(BaseModel):
    email: str
    password: str
    
class RegisterRequest(BaseModel):
    name: str
    surname: str
    email: str
    password: str
    isTeacher: bool

class UserAuth(BaseModel):
    userId: int
    authKey: str

class CreateClass(BaseModel):
    name: str
    color: str

class GetClass(BaseModel):
    userId: int

class GetStudents(BaseModel):
    classId: int

class JoinRequest(BaseModel):
    invitationCode: str

class JoinResponse(BaseModel):
    requestId: int
    classId: int
    userId: int
    accept: bool

#-------------------------------------------- login and register

@app.post("/api/userRegister")
def user_register(body: RegisterRequest):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = %s", (body.email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=409, detail="User already exists")

    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    cur.execute(
        "INSERT INTO users (name, surname, email, password_hash, is_teacher) VALUES (%s, %s, %s, %s, %s)",
        (body.name, body.surname, body.email, password_hash, body.isTeacher)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {"status": "ok"}

@app.post("/api/userLogin")
def user_login(body: AuthRequest, response: Response):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, password_hash FROM users WHERE email = %s", (body.email,))
    user = cur.fetchone()

    if not user or not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        cur.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Zły login lub hasło")

    user_id = user["id"]
    auth_key = secrets.token_hex(32)
    token = f"{user_id}:{auth_key}" 

    cur.execute(
        "INSERT INTO sessions (user_id, auth_key, token) VALUES (%s, %s, %s)",
        (user_id, auth_key, token)
    )
    conn.commit()
    cur.close()
    conn.close()

    response.set_cookie(
        key="userId", 
        value=str(user_id), 
        httponly=True, 
        samesite="lax", 
        secure=False, 
        path="/"   
    )
    response.set_cookie(
        key="authKey", 
        value=auth_key, 
        httponly=True, 
        samesite="lax", 
        secure=False,
        path="/"
    )

    return {"status": "ok"}

@app.post("/api/auth")
def user_auth(
    userId: Optional[str] = Cookie(None), 
    authKey: Optional[str] = Cookie(None)
):
    if not userId or not authKey:
        raise HTTPException(status_code=401, detail="No session cookies found")

    conn = get_db()
    try:
        cur = conn.cursor()

        cur.execute(
            "SELECT user_id FROM sessions WHERE user_id = %s AND auth_key = %s",
            (int(userId), authKey)
        )
        session = cur.fetchone()

        if not session:
            print(f"FAIL: No match found for User {userId} and Key {authKey}")
            raise HTTPException(status_code=401, detail="Invalid session")

        cur.execute(
            "SELECT id, name, surname, email, is_teacher FROM users WHERE id = %s",
            (int(userId),)
        )
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        print("SUCCESS: User authenticated")
        return {
            "status": "ok",
            "user": user 
        }
        
    finally:
        cur.close()
        conn.close()

def generate_invitation_code(length=16):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

@app.post("/api/addClass")
def addClass(
    body: CreateClass,
    userId: Optional[str] = Cookie(None)
):
    
    if not userId:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()    

        invitationCode = generate_invitation_code()
        
        cur.execute(
            "INSERT INTO classes (creator_id, name, color, invitationCode) VALUES (%s, %s, %s, %s) RETURNING id",
            (int(userId), body.name, body.color, invitationCode)
        )

        class_id = cur.fetchone()["id"]
        conn.commit()
        
        cur.close()
        conn.close()

        return {
            "status": "ok",
            "classId": class_id,
            "invitationCode": invitationCode
        }
    
    except Exception as e:
        if conn:
            conn.rollback()
            cur.close()
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/getClasses")
def getClasses(userId: Optional[str] = Cookie(None)):
    conn = get_db()
    cur = conn.cursor()  

    cur.execute(
        "SELECT * FROM classes WHERE creator_id = %s",
        (int(userId),)
    )
    
    result = cur.fetchall()
    cur.close()
    conn.close()
    return result

@app.get("/api/getClassesStudent")
def getClassesStudent(userId: Optional[str] = Cookie(None)):
    if not userId:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_db()
    cur = conn.cursor()

    try:
        query = """
            SELECT 
                c.id, 
                c.creator_id, 
                c.name, 
                c.color, 
                c.invitationCode, 
                c.created_at 
            FROM classes c
            JOIN studentToClass stc ON c.id = stc.class_id
            WHERE stc.student_id = %s
            ORDER BY c.created_at DESC
        """
        cur.execute(query, (int(userId),))
        result = cur.fetchall()

        return result

    except Exception as e:
        print(f"Error fetching student classes: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        cur.close()
        conn.close()   

@app.get("/api/fetchClass")
def fetchClass(classId: int = Query(...)):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM classes WHERE id = %s",
        (classId,)
    )

    result = cur.fetchall()
    cur.close()
    conn.close()
    return result

@app.get("/api/fetchStudents")
def fetchStudents(classId: int = Query(...)):
    conn = get_db()
    cur = conn.cursor()
 
    try:
        cur.execute(
            "SELECT id FROM classes WHERE id = %s",
            (classId,)
        )
        cls = cur.fetchone()
        
        if not cls:
            raise HTTPException(status_code=404, detail="Class not found")
 
        query = """
            SELECT 
                u.id as user_id,
                u.name,
                u.surname,
                u.email,
                stc.created_at
            FROM studentToClass stc
            JOIN users u ON stc.student_id = u.id
            WHERE stc.class_id = %s
            ORDER BY stc.created_at ASC
        """
        cur.execute(query, (classId,))
        students = cur.fetchall()
 
        return {
            "status": "ok",
            "students": students
        }
 
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching students: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        cur.close()
        conn.close()        

@app.get("/api/fetchInvitations")
def fetchInvitations(
    classId: int = Query(...), 
    userId: Optional[str] = Cookie(None)
):
    if not userId:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_db()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT creator_id FROM classes WHERE id = %s",
            (classId,)
        )
        cls = cur.fetchone()
        
        if not cls:
            raise HTTPException(status_code=404, detail="Class not found")
        
        if cls["creator_id"] != int(userId):
            raise HTTPException(status_code=403, detail="You are not the teacher of this class")

        query = """
            SELECT 
                u.id as user_id, 
                u.name, 
                u.surname, 
                u.email, 
                jr.id as request_id, 
                jr.created_at 
            FROM joinRequest jr
            JOIN users u ON jr.student_id = u.id
            WHERE jr.class_id = %s
            ORDER BY jr.created_at DESC
        """
        cur.execute(query, (classId,))
        invitations = cur.fetchall()

        return {
            "status": "ok",
            "invitations": invitations
        }

    except Exception as e:
        print(f"Error fetching invitations: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        cur.close()
        conn.close()
    
@app.post("/api/classJoinRequest")
def classJoinRequest(
    body: JoinRequest,
    userId: Optional[str] = Cookie(None)
):
    if not userId:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor()   
        
        cur.execute(
            "SELECT id FROM classes WHERE invitationCode = %s",
            (body.invitationCode,)
        )
        target_class = cur.fetchone()
        
        if not target_class:
            raise HTTPException(status_code=404, detail="Invalid invitation code")
            
        class_id = target_class["id"]

        cur.execute(
            "SELECT id FROM studentToClass WHERE class_id = %s AND student_id = %s",
            (class_id, int(userId))
        )
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="juz jestes w tej klasie")

        cur.execute(
            "SELECT id FROM joinRequest WHERE class_id = %s AND student_id = %s",
            (class_id, int(userId))
        )
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Join request already sent")

        cur.execute(
            "INSERT INTO joinRequest (class_id, student_id) VALUES (%s, %s) RETURNING id",
            (class_id, int(userId))
        )
        
        request_id = cur.fetchone()["id"]
        conn.commit()
        
        return {
            "status": "ok",
            "requestId": request_id,
            "message": "Join request sent successfully"
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.post("/api/joinResponse")
def joinResponse(body: JoinResponse):
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "SELECT student_id FROM joinRequest WHERE id = %s",
            (body.requestId,)
        )
        join_req = cur.fetchone()

        if not join_req:
            raise HTTPException(status_code=404, detail="Join request not found")

        student_id = join_req["student_id"]

        if body.accept:
            cur.execute(
                "INSERT INTO studentToClass (class_id, student_id) VALUES (%s, %s)",
                (body.classId, student_id)
            )

        cur.execute(
            "DELETE FROM joinRequest WHERE id = %s",
            (body.requestId,)
        )

        conn.commit()

        return {"status": "ok"}

    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.post("/api/force/deleteAllClasses")
def deleteAllClasses():
    conn = get_db()
    cur = conn.cursor()  

    cur.execute(
        "DROP TABLE IF EXISTS classes"
    )  

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "ok"}

@app.post("/api/force/resetDataBase")
def resetDataBase():
    conn = None
    cur = None
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            DO $$ DECLARE r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """)

        conn.commit()
        cur.close()
        conn.close()
        
        init_db()

        return {"status": "ok"}
    
    except Exception as e:
        if conn:
            conn.rollback()
        if cur:
            cur.close()
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    



#-------------------------------------------- login and register



# @app.get("/debug/getAllUsers")
# def get_all_users():
#     conn = get_db()
#     try:
#         cur = conn.cursor()
#         cur.execute("SELECT name, surname, isTeacher FROM users")
#         users = cur.fetchall()
        
#         return {
#             "status": "ok",
#             "count": len(users),
#             "users": users
#         }
#     except Exception as e:
#         print(f"Error fetching users: {e}")
#         raise HTTPException(status_code=500, detail="Internal Server Error")
#     finally:
#         cur.close()
#         conn.close()