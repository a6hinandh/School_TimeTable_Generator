from ortools.sat.python import cp_model
from models import Teacher, InputTeacher, Timetable
from typing import List, Dict, Tuple, Optional
from collections import defaultdict

class TimetableError(Exception):
    """Custom exception for timetable generation errors"""
    def __init__(self, message: str, error_type: str = "CONSTRAINT_VIOLATION", details: Dict = None):
        self.message = message
        self.error_type = error_type
        self.details = details or {}
        super().__init__(self.message)

def validate_input_constraints(teacher_list: dict, classes: List[str], working_days: int, periods_per_day: int) -> List[Dict]:
    """Validate input constraints and return list of errors"""
    errors = []
    total_periods_per_class = working_days * periods_per_day
    
    # Check 1: Total periods per class constraint
    for cls in classes:
        total_required = 0
        class_subjects = {}
        
        for teacher_name, teacher in teacher_list.items():
            if cls in teacher.subjects_by_class:
                for subject, periods in teacher.subjects_by_class[cls].items():
                    total_required += periods
                    if subject not in class_subjects:
                        class_subjects[subject] = []
                    class_subjects[subject].append((teacher_name, periods))
        
        if total_required > total_periods_per_class:
            errors.append({
                "type": "PERIODS_OVERFLOW",
                "message": f"Class {cls} requires {total_required} periods but only {total_periods_per_class} periods are available ({working_days} days × {periods_per_day} periods/day)",
                "class": cls,
                "required": total_required,
                "available": total_periods_per_class,
                "excess": total_required - total_periods_per_class
            })
    
    # Check 2: Daily subject limit (max 2 periods per subject per day)
    for cls in classes:
        for teacher_name, teacher in teacher_list.items():
            if cls in teacher.subjects_by_class:
                for subject, total_periods in teacher.subjects_by_class[cls].items():
                    max_possible_periods = working_days * 2  # 2 periods max per day
                    
                    if total_periods > max_possible_periods:
                        errors.append({
                            "type": "DAILY_SUBJECT_LIMIT",
                            "message": f"Subject '{subject}' for class {cls} requires {total_periods} periods, but maximum possible is {max_possible_periods} periods ({working_days} days × 2 periods/day limit)",
                            "teacher": teacher_name,
                            "class": cls,
                            "subject": subject,
                            "required": total_periods,
                            "max_possible": max_possible_periods
                        })
    
    # Check 3: Teacher availability (max 1 class per period)
    for teacher_name, teacher in teacher_list.items():
        total_teacher_periods = 0
        teacher_classes = []
        
        for cls, subjects in teacher.subjects_by_class.items():
            class_periods = sum(subjects.values())
            total_teacher_periods += class_periods
            teacher_classes.append((cls, class_periods))
        
        max_teacher_periods = working_days * periods_per_day
        
        if total_teacher_periods > max_teacher_periods:
            errors.append({
                "type": "TEACHER_OVERLOAD",
                "message": f"Teacher {teacher_name} is assigned {total_teacher_periods} periods but maximum possible is {max_teacher_periods} periods ({working_days} days × {periods_per_day} periods/day)",
                "teacher": teacher_name,
                "assigned_periods": total_teacher_periods,
                "max_periods": max_teacher_periods,
                "classes": teacher_classes
            })
    
    # Check 4: Lab subject constraints (must be even number of periods)
    for teacher_name, teacher in teacher_list.items():
        for subject in teacher.lab_subjects:
            for cls, subjects in teacher.subjects_by_class.items():
                if subject in subjects:
                    periods = subjects[subject]
                    if periods % 2 != 0:
                        errors.append({
                            "type": "LAB_PERIOD_ODD",
                            "message": f"Lab subject '{subject}' for class {cls} has {periods} periods, but lab subjects must have even number of periods (for consecutive scheduling)",
                            "teacher": teacher_name,
                            "class": cls,
                            "subject": subject,
                            "periods": periods
                        })
    
    # Check 5: Main subject availability for class teachers (UPDATED - More Flexible)
    for teacher_name, teacher in teacher_list.items():
        if teacher.assigned_class and hasattr(teacher, 'main_subject'):
            cls = teacher.assigned_class
            main_subject = teacher.main_subject
            
            if cls not in teacher.subjects_by_class or main_subject not in teacher.subjects_by_class[cls]:
                errors.append({
                    "type": "MAIN_SUBJECT_MISSING",
                    "message": f"Class teacher {teacher_name} is assigned to class {cls} with main subject '{main_subject}', but this subject is not assigned to them for this class",
                    "teacher": teacher_name,
                    "class": cls,
                    "main_subject": main_subject
                })
            # REMOVED: The strict check for minimum periods per day
            # Now the solver will just assign as many first periods as possible based on available periods
    
    # Check 6: Duplicate subject assignments
    subject_assignments = defaultdict(list)
    for teacher_name, teacher in teacher_list.items():
        for cls, subjects in teacher.subjects_by_class.items():
            for subject in subjects:
                subject_assignments[(cls, subject)].append(teacher_name)
    
    for (cls, subject), teachers in subject_assignments.items():
        if len(teachers) > 1:
            errors.append({
                "type": "DUPLICATE_SUBJECT",
                "message": f"Subject '{subject}' for class {cls} is assigned to multiple teachers: {', '.join(teachers)}. Each subject-class combination should have only one teacher.",
                "class": cls,
                "subject": subject,
                "teachers": teachers
            })
    
    return errors

def convert_input_teachers(input_teachers: List[InputTeacher]) -> dict:
    teacher_list = {}
    for t in input_teachers:
        teacher = Teacher(
            name=t.name,
            subjects_by_class=t.subjects_by_class,
            main_subject=t.main_subject,
            assigned_class=t.assigned_class
        )
        teacher.lab_subjects = set(t.lab_subjects or [])
        teacher_list[t.name] = teacher
    return teacher_list

def generate_from_input(input_teachers: List[InputTeacher], classes: List[str], working_days: int, periods_per_day: int):
    teacher_list = convert_input_teachers(input_teachers)
    
    # Validate constraints before attempting generation
    constraint_errors = validate_input_constraints(teacher_list, classes, working_days, periods_per_day)
    
    if constraint_errors:
        # Group errors by type for better presentation
        error_summary = defaultdict(list)
        for error in constraint_errors:
            error_summary[error["type"]].append(error)
        
        # Create comprehensive error message
        error_message = "❌ Timetable generation failed due to constraint violations:\n\n"
        
        for error_type, errors in error_summary.items():
            error_message += f"📍 {error_type.replace('_', ' ').title()}:\n"
            for error in errors:
                error_message += f"  • {error['message']}\n"
            error_message += "\n"
        
        raise TimetableError(
            message=error_message.strip(),
            error_type="INPUT_VALIDATION_FAILED",
            details={"constraint_errors": constraint_errors}
        )
    
    # Debug: Log total periods per class
    for cls in classes:
        total = 0
        for t in teacher_list.values():
            if cls in t.subjects_by_class:
                total += sum(t.subjects_by_class[cls].values())
        print(f"📊 Class {cls} requires {total} periods (max available: {working_days * periods_per_day})")
    
    return generate_with_teacher_list(teacher_list, classes, working_days, periods_per_day)

def generate_with_teacher_list(teacher_list: dict, classes: List[str], working_days: int, periods_per_day: int):
    model = cp_model.CpModel()
    pair_to_id = {}
    id_to_pair = {}
    current_id = 1

    for teacher in teacher_list.values():
        for cls, subjects in teacher.subjects_by_class.items():
            for subject in subjects:
                pair = (teacher.name, subject, cls)
                if pair not in pair_to_id:
                    pair_to_id[pair] = current_id
                    id_to_pair[current_id] = pair
                    current_id += 1

    timetable = {
        cls: [[model.NewIntVar(0, current_id, f"{cls}_d{d}_p{p}")
              for p in range(periods_per_day)] for d in range(working_days)]
        for cls in classes
    }

    # Teacher conflict constraint
    for teacher in teacher_list.values():
        for d in range(working_days):
            for p in range(periods_per_day):
                teacher_pairs = [(pid, cls) for pid, (tname, _, cls) in id_to_pair.items() if tname == teacher.name]
                class_assignments = []
                for pid, cls in teacher_pairs:
                    is_assigned = model.NewBoolVar(f"{teacher.name}_{cls}_d{d}_p{p}_{pid}")
                    model.Add(timetable[cls][d][p] == pid).OnlyEnforceIf(is_assigned)
                    model.Add(timetable[cls][d][p] != pid).OnlyEnforceIf(is_assigned.Not())
                    class_assignments.append(is_assigned)
                if class_assignments:
                    model.Add(sum(class_assignments) <= 1)

    # Subject count constraint
    for pid, (tname, subject, cls) in id_to_pair.items():
        count = teacher_list[tname].subjects_by_class[cls][subject]
        occurrences = []
        for d in range(working_days):
            for p in range(periods_per_day):
                var = timetable[cls][d][p]
                b = model.NewBoolVar(f"occ_{cls}_{d}_{p}_{pid}")
                model.Add(var == pid).OnlyEnforceIf(b)
                model.Add(var != pid).OnlyEnforceIf(b.Not())
                occurrences.append(b)
        model.Add(sum(occurrences) == count)

    # Daily subject limit constraint (max 2 periods per subject per day)
    for cls in classes:
        for d in range(working_days):
            all_subjects = {
                subject
                for teacher in teacher_list.values()
                for subcls, subs in teacher.subjects_by_class.items()
                if subcls == cls for subject in subs
            }
            for subject in all_subjects:
                subject_ids = [pid for pid, (_, subj, c) in id_to_pair.items() if subj == subject and c == cls]
                count_vars = []
                for p in range(periods_per_day):
                    var = timetable[cls][d][p]
                    for pid in subject_ids:
                        b = model.NewBoolVar(f"{cls}_{d}_{p}_{subject}_{pid}")
                        model.Add(var == pid).OnlyEnforceIf(b)
                        model.Add(var != pid).OnlyEnforceIf(b.Not())
                        count_vars.append(b)
                model.Add(sum(count_vars) <= 2)

    # Lab subject consecutive scheduling constraint
    for pid, (tname, subject, cls) in id_to_pair.items():
        if subject in teacher_list[tname].lab_subjects:
            total = teacher_list[tname].subjects_by_class[cls][subject]
            if total % 2 != 0:
                continue
            num_blocks = total // 2
            block_vars = []
            for d in range(working_days):
                for p in range(periods_per_day - 1):
                    first = timetable[cls][d][p]
                    second = timetable[cls][d][p + 1]
                    is_block = model.NewBoolVar(f"lab_block_{cls}_{d}_{p}_{pid}")
                    model.Add(first == pid).OnlyEnforceIf(is_block)
                    model.Add(second == pid).OnlyEnforceIf(is_block)
                    block_vars.append(is_block)
            model.Add(sum(block_vars) == num_blocks)

    # UPDATED: Class teacher main subject first period constraint (More Flexible)
    for teacher in teacher_list.values():
        if teacher.assigned_class and hasattr(teacher, 'main_subject'):
            cls = teacher.assigned_class
            main_subject = teacher.main_subject
            main_subject_id = next(
                (pid for pid, (tname, subject, class_name) in id_to_pair.items()
                 if tname == teacher.name and subject == main_subject and class_name == cls),
                None
            )
            if main_subject_id is not None and cls in teacher.subjects_by_class and main_subject in teacher.subjects_by_class[cls]:
                total_main_subject_periods = teacher.subjects_by_class[cls][main_subject]
                first_period_main_subject = []
                for d in range(working_days):
                    is_first = model.NewBoolVar(f"{cls}_d{d}_main_first_{teacher.name}")
                    model.Add(timetable[cls][d][0] == main_subject_id).OnlyEnforceIf(is_first)
                    model.Add(timetable[cls][d][0] != main_subject_id).OnlyEnforceIf(is_first.Not())
                    first_period_main_subject.append(is_first)
                
                # UPDATED: Assign as many first periods as available, up to total periods
                # If teacher has 2 periods, assign 2 first periods
                # If teacher has 10 periods, assign up to working_days first periods
                max_first_periods = min(working_days, total_main_subject_periods)
                model.Add(sum(first_period_main_subject) == max_first_periods)

    # Valid assignment constraint
    for cls in classes:
        for d in range(working_days):
            for p in range(periods_per_day):
                valid_assignments = []
                for pid in id_to_pair:
                    if id_to_pair[pid][2] == cls:
                        b = model.NewBoolVar(f"valid_{cls}_{d}_{p}_{pid}")
                        model.Add(timetable[cls][d][p] == pid).OnlyEnforceIf(b)
                        model.Add(timetable[cls][d][p] != pid).OnlyEnforceIf(b.Not())
                        valid_assignments.append(b)
                if valid_assignments:
                    model.Add(sum(valid_assignments) <= 1)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60
    status = solver.Solve(model)

    print("🧠 Solver status:", solver.StatusName(status))  # Debug log

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        class_tt = {}
        for cls in classes:
            class_tt[cls] = []
            for d in range(working_days):
                row = []
                for p in range(periods_per_day):
                    val = solver.Value(timetable[cls][d][p])
                    if val in id_to_pair:
                        teacher, subject, _ = id_to_pair[val]
                        row.append(f"{subject}({teacher})")
                    else:
                        row.append("Free")
                class_tt[cls].append(row)

        teacher_timetables = {}
        for teacher_name, teacher in teacher_list.items():
            teacher_tt = [["Free"] * periods_per_day for _ in range(working_days)]
            for cls in classes:
                for d in range(working_days):
                    for p in range(periods_per_day):
                        entry = class_tt[cls][d][p]
                        if entry != "Free":
                            # Extract teacher name from entry format: "subject(teacher)"
                            if '(' in entry and ')' in entry:
                                subject_part = entry.split('(')[0]
                                teacher_part = entry.split('(')[1].rstrip(')')
                                
                                # Exact match instead of substring match
                                if teacher_part == teacher_name:
                                    teacher_tt[d][p] = f"{subject_part} - {cls}"
            teacher_timetables[teacher_name] = teacher_tt

        return Timetable(data=class_tt), Timetable(data=teacher_timetables)
    
    elif status == cp_model.INFEASIBLE:
        raise TimetableError(
            message="❌ No feasible timetable solution exists with the given constraints. This might be due to:\n"
                   "• Too many periods assigned relative to available time slots\n"
                   "• Conflicting teacher assignments\n"
                   "• Lab subject scheduling conflicts\n"
                   "• Class teacher main subject constraints cannot be satisfied\n\n"
                   "Please review your input and try reducing some period assignments or adjusting constraints.",
            error_type="INFEASIBLE_SOLUTION"
        )
    elif status == cp_model.MODEL_INVALID:
        raise TimetableError(
            message="❌ The timetable model is invalid. This is likely due to conflicting constraints in the input data.",
            error_type="INVALID_MODEL"
        )
    else:
        raise TimetableError(
            message=f"❌ Timetable generation failed with solver status: {solver.StatusName(status)}. "
                   "This might be due to time limits or other solver issues. Please try with simpler constraints or contact support.",
            error_type="SOLVER_ERROR",
            details={"solver_status": solver.StatusName(status)}
        )