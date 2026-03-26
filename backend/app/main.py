from fastapi import FastAPI, Response, Request, HTTPException
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
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
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
    userName: str
    password: str


#-------------------------------------------- login and register

@app.post("/api/userRegister")
def user_register(body: AuthRequest):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE username = %s", (body.userName,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=409, detail="Użytkownik już instnieje")

    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    cur.execute(
        "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
        (body.userName, password_hash)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {"status": "ok"}


@app.post("/api/userLogin")
def user_login(body: AuthRequest, response: Response):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, password_hash FROM users WHERE username = %s", (body.userName,))
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

    response.set_cookie(key="userId", value=str(user_id), httponly=True, samesite="lax")
    response.set_cookie(key="authKey", value=auth_key, httponly=True, samesite="lax")

    return {"status": "ok"}

#-------------------------------------------- login and register

