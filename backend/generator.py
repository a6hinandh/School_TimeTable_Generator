from ortools.sat.python import cp_model
from models import Teacher, InputTeacher, Timetable
from typing import List, Dict
from collections import defaultdict

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
                model.Add(sum(first_period_main_subject) == min(working_days, total_main_subject_periods))

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

    print("❌ Timetable generation failed: no feasible solution.")
    raise ValueError("Timetable generation failed: No feasible solution due to constraints.")

    return Timetable(data={}), Timetable(data={})