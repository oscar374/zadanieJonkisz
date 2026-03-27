from fastapi import FastAPI, Response, Cookie, HTTPException
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
import bcrypt
import secrets
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
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
    userId: int;
    authKey: str;

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

    print("is teacher: ");
    print(body.isTeacher);

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

