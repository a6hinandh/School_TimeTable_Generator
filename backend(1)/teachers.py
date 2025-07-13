# teachers.py

from models import Teacher

teacher_list: dict[str, Teacher] = {}

def addTeacher(name, subjects_by_class, main_subject, assigned_class=None, lab_subjects=None):
    teacher = Teacher(
        name=name,
        subjects_by_class=subjects_by_class,
        main_subject=main_subject,
        assigned_class=assigned_class
    )
    teacher.lab_subjects = set(lab_subjects) if lab_subjects else set()
    teacher_list[name] = teacher


# --- Add all teachers below ---

addTeacher('BS', {
    'XA': { 'Hindi': 3 },
    'XB': { 'Hindi': 3 },
    'IXA': { 'Hindi': 3 },
    'IXB': { 'Hindi': 3 },
    'IXC': { 'Hindi': 3 },
    'VIIIA': { 'Hindi': 3 },
    'VIIIB': { 'Hindi': 3 },
    'VIIIC': { 'Hindi': 3 }
}, 'Hindi')

addTeacher('PG', {
    'XB': { 'Mathematics': 6 },
    'IXA': { 'Mathematics': 5 },
    'IXB': { 'Mathematics': 5, 'WE': 2, 'LA': 1 },
    'VIIIC': { 'Mathematics': 5 }
}, 'Mathematics', 'IXB')

addTeacher('SPR', {
    'XA': { 'Mathematics': 6 },
    'IXC': { 'Mathematics': 5, 'IT': 4 },
    'VIIIA': { 'Mathematics': 5 },
    'VIIIB': { 'Mathematics': 5 }
}, 'Mathematics', 'XA', lab_subjects=['IT'])

addTeacher('APS', {
    'XB': { 'Malayalam': 6 },
    'IXA': { 'Malayalam': 6 },
    'IXB': { 'Malayalam': 6 },
    'VIIIA': { 'Malayalam': 6 }
}, 'Malayalam', 'XB')

addTeacher('RA', {
    'XA': { 'Malayalam': 6 },
    'IXC': { 'Malayalam': 6 },
    'VIIIB': { 'Malayalam': 6 },
    'VIIIC': { 'Malayalam': 6 }
}, 'Malayalam')

addTeacher('TJ', {
    'XB': { 'Social Science': 6, 'WE': 1 },
    'IXA': { 'Social Science': 5 },
    'VIIIA': { 'Social Science': 4 },
    'VIIIB': { 'Social Science': 4 },
    'VIIIC': { 'Social Science': 4 }
}, 'Social Science')

addTeacher('RS', {
    'XA': { 'Social Science': 6, 'WE': 1 },
    'IXB': { 'Social Science': 5 },
    'IXC': { 'Social Science': 5, 'LA': 1 },
    'VIIIC': { 'IT': 4 },
    'VIIIA': { 'WE': 2 }
}, 'Social Science', lab_subjects=['IT'])

addTeacher('IPS', {
    'XA': { 'English': 5, 'IT': 4 },
    'IXC': { 'English': 5 },
    'VIIIA': { 'English': 5 },
    'VIIIC': { 'English': 5, 'LA': 1 }
}, 'English','VIIIC', lab_subjects=['IT'])

addTeacher('APD', {
    'XB': { 'English': 5 },
    'IXA': { 'English': 5 },
    'IXB': { 'English': 5 },
    'VIIIB': { 'English': 5, 'WE': 2, 'LA': 1 },
    'VIIIC': { 'WE': 2 }
}, 'English', 'VIIIB')

addTeacher('SMG', {
    'XA': { 'Physics': 2 },
    'XB': { 'Physics': 2 },
    'IXA': { 'Physics': 2, 'IT': 4 },
    'IXB': { 'Physics': 2, 'IT': 4 },
    'IXC': { 'Physics': 2 },
    'VIIIA': { 'Physics': 2 },
    'VIIIB': { 'Physics': 2 },
    'VIIIC': { 'Physics': 2 }
}, 'Physics', lab_subjects=['IT'])

addTeacher('RMV', {
    'XA': { 'Chemistry': 2 },
    'XB': { 'Chemistry': 2 },
    'IXA': { 'Chemistry': 2 },
    'IXB': { 'Chemistry': 2 },
    'IXC': { 'Chemistry': 2 },
    'VIIIA': { 'Chemistry': 2, 'IT': 4, 'LA': 1 },
    'VIIIB': { 'Chemistry': 2, 'IT': 4 },
    'VIIIC': { 'Chemistry': 2 }
}, 'Chemistry','VIIIA', lab_subjects=['IT'])

addTeacher('JK', {
    'XA': { 'Biology': 3 },
    'XB': { 'Biology': 3, 'IT': 4 },
    'IXA': { 'Biology': 2, 'WE': 2, 'LA': 1 },
    'IXB': { 'Biology': 2 },
    'IXC': { 'Biology': 2 },
    'VIIIA': { 'Biology': 2 },
    'VIIIB': { 'Biology': 2 },
    'VIIIC': { 'Biology': 2 }
}, 'Biology', 'IXA', lab_subjects=['IT'])

addTeacher('JTJ', {
    'XA': { 'Art': 1 },
    'XB': { 'Art': 1 },
    'IXA': { 'Art': 2 },
    'IXB': { 'Art': 2 },
    'IXC': { 'Art': 2, 'WE': 2 },
    'VIIIA': { 'Art': 2 },
    'VIIIB': { 'Art': 2 },
    'VIIIC': { 'Art': 2 }
}, 'Art','IXC')

addTeacher('AS', {
    'XA': { 'PE': 1 },
    'XB': { 'PE': 1 },
    'IXA': { 'PE': 1 },
    'IXB': { 'PE': 1 },
    'IXC': { 'PE': 1 },
    'VIIIA': { 'PE': 2 },
    'VIIIB': { 'PE': 2 },
    'VIIIC': { 'PE': 2 }
}, 'PE')
