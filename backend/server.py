from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from models import InputTeacher
from generator import generate_from_input
import traceback

app = FastAPI()

# ✅ Enable CORS for correct frontend port (5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Updated from 3000 to 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TeacherPeriod(BaseModel):
    class_name: str
    subject: str
    noOfPeriods: int

class TeacherInput(BaseModel):
    name: str
    subjects: List[str]
    mainSubject: str
    labPeriod: Optional[str] = None
    assigned_class: Optional[str] = None
    periods: List[TeacherPeriod]

class TimetableRequest(BaseModel):
    workingDays: int
    periods: int
    classes: List[str]
    subjects: List[str]
    teachers: List[TeacherInput]

@app.post("/generate")
async def generate_timetable(request: TimetableRequest):
    try:
        print(f"Received request: {request}")
        
        input_teachers = []
        for teacher in request.teachers:
            subjects_by_class = {}
            for period in teacher.periods:
                class_name = period.class_name
                subject = period.subject
                no_of_periods = period.noOfPeriods
                if class_name not in subjects_by_class:
                    subjects_by_class[class_name] = {}
                subjects_by_class[class_name][subject] = no_of_periods
            
            lab_subjects = []
            if teacher.labPeriod and teacher.labPeriod != "Select Lab Period":
                lab_subjects = [teacher.labPeriod]
            
            input_teacher = InputTeacher(
                name=teacher.name,
                subjects_by_class=subjects_by_class,
                main_subject=teacher.mainSubject,
                assigned_class=teacher.assigned_class if teacher.assigned_class != "Select Class" else None,
                lab_subjects=lab_subjects
            )
            input_teachers.append(input_teacher)
        
        print(f"Converted input teachers: {input_teachers}")
        
        class_timetable, teacher_timetable = generate_from_input(
            input_teachers, 
            request.classes, 
            request.workingDays, 
            request.periods
        )

        if not class_timetable.data:
            return {
                "message": "❌ Timetable generation failed. No feasible solution found.",
                "class_timetable": {},
                "teacher_timetable": {},
                "status": "INFEASIBLE"
            }

        return {
            "class_timetable": class_timetable.data,
            "teacher_timetable": teacher_timetable.data,
            "message": "✅ Timetable generated successfully",
            "status": "FEASIBLE"
        }

    except Exception as e:
        print(f"Error generating timetable: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Timetable Generator API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
