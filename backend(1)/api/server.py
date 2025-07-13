from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import InputTeacher
from generator import generate_from_input

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Welcome to Timetable Generator API"}

@app.post("/generate")
def generate_timetable(teachers: List[InputTeacher]):
    class_tt, teacher_tt = generate_from_input(teachers)
    return {
        "class_timetables": class_tt.data,
        "teacher_timetables": teacher_tt.data
    }
