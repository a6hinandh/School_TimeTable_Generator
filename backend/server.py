from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from models import InputTeacher
from generator import generate_from_input
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from pytz import timezone
import pymongo


import traceback
import os

load_dotenv()

app = FastAPI()

# ✅ Enable CORS for correct frontend port (5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Updated from 3000 to 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = pymongo.MongoClient(
   os.getenv("MONGO_URI"),
    tls=True,
    tlsAllowInvalidCertificates=False
)
db = client["timetableDB"]
collection = db["timetables"]

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
    userId : str 
    title : Optional[str] = None
    

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
            "status": "FEASIBLE",
            "userId" : request.userId,
            "title" : request.title,
            "teacherData":request.teachers,
            "classes":request.classes,
            "subjects":request.subjects,
            "workingDays":request.workingDays,
            "periods":request.periods
        }

    except Exception as e:
        print(f"Error generating timetable: {e}")
        print(traceback.format_exc())
        return{
            "message": f"❌ Timetable generation failed due to error: {str(e)}",
            "class_timetable":{},
            "teacher_timetable":{},
            "status":"ERROR"
        }
    

@app.post("/add")
async def add_timetable(request: Request):
    data = await request.json()
    india = timezone("Asia/Kolkata")
    data["createdAt"] = datetime.now(india).isoformat()
    result = collection.insert_one(data)
    inserted_doc = collection.find_one({"_id":result.inserted_id})
    inserted_doc["_id"] = str(inserted_doc["_id"])  
    return jsonable_encoder(inserted_doc)

@app.get("/get-timetables/{user_id}")
def get_timetables(user_id: str):
    data = []
    query = {"userId": user_id}  

    for doc in collection.find(query).sort("createdAt", pymongo.DESCENDING):
        doc["_id"] = str(doc["_id"])  
        if isinstance(doc.get("createdAt"), datetime):
            doc["createdAt"] = doc["createdAt"].isoformat()
        data.append(doc)

    return data

@app.put("/update-timetable/{timetable_id}")
async def update_timetable(timetable_id: str, request:Request):
    data = await request.json()
    india = timezone("Asia/Kolkata")
    updated_doc = collection.find_one_and_update(
        {"_id": ObjectId(timetable_id)},
        {"$set": {"class_timetable": data["class_timetable"],"teacher_timetable":data["teacher_timetable"],"createdAt":datetime.now(india).isoformat(),"teacherData":data["teacherData"]}},
        return_document=pymongo.ReturnDocument.AFTER
    )
    updated_doc["_id"] = str(updated_doc["_id"])  
    return jsonable_encoder(updated_doc)

@app.delete("/delete-timetable/{timetable_id}")
async def delete_timetable(timetable_id: str):
    result = collection.delete_one({"_id": ObjectId(timetable_id)})
    if result.deleted_count == 1:
        return {"message": "Deleted"}
    return {"message": "Not Found"}



@app.get("/")
async def root():
    return {"message": "Timetable Generator API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
