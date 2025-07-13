# # models.py

# from dataclasses import dataclass, field
# from typing import Dict, List, Optional

# @dataclass
# class SubjectAssignment:
#     subject: str
#     periods: int

# @dataclass
# class Teacher:
#     name: str
#     subjects_by_class: Dict[str, Dict[str, int]]  # class -> subject -> periods
#     main_subject: str
#     assigned_class: Optional[str] = None

# @dataclass
# class Timetable:
#     data: Dict[str, List[List[Optional[str]]]]  # key: class or teacher -> [day][period]


from typing import Dict, List, Optional
from pydantic import BaseModel  # used by FastAPI

# Existing Timetable and Teacher class stays...

class InputTeacher(BaseModel):
    name: str
    subjects_by_class: Dict[str, Dict[str, int]]
    main_subject: str
    assigned_class: Optional[str] = None
    lab_subjects: Optional[List[str]] = []
