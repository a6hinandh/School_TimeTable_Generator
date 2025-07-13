# from ortools.sat.python import cp_model
# from teachers import teacher_list
# from config import CLASSES, DAYS_PER_WEEK, PERIODS_PER_DAY
# from models import Timetable
# from collections import defaultdict

# def generate():
#     model = cp_model.CpModel()
#     pair_to_id = {}
#     id_to_pair = {}
#     current_id = 1

#     for teacher in teacher_list.values():
#         for cls, subjects in teacher.subjects_by_class.items():
#             for subject in subjects:
#                 pair = (teacher.name, subject, cls)
#                 if pair not in pair_to_id:
#                     pair_to_id[pair] = current_id
#                     id_to_pair[current_id] = pair
#                     current_id += 1

#     timetable = {}
#     for cls in CLASSES:
#         timetable[cls] = []
#         for d in range(DAYS_PER_WEEK):
#             row = []
#             for p in range(PERIODS_PER_DAY):
#                 var = model.NewIntVar(0, current_id, f"{cls}_d{d}_p{p}")
#                 row.append(var)
#             timetable[cls].append(row)

#     # Constraint 1: No teacher conflict
#     for teacher in teacher_list.values():
#         for d in range(DAYS_PER_WEEK):
#             for p in range(PERIODS_PER_DAY):
#                 teacher_pairs = [
#                     (pid, cls) for pid, (tname, _, cls) in id_to_pair.items() if tname == teacher.name
#                 ]
#                 class_assignments = []
#                 for pid, cls in teacher_pairs:
#                     is_assigned = model.NewBoolVar(f"{teacher.name}_{cls}_d{d}_p{p}_{pid}")
#                     model.Add(timetable[cls][d][p] == pid).OnlyEnforceIf(is_assigned)
#                     model.Add(timetable[cls][d][p] != pid).OnlyEnforceIf(is_assigned.Not())
#                     class_assignments.append(is_assigned)
#                 if class_assignments:
#                     model.Add(sum(class_assignments) <= 1)

#     # Constraint 2: Assign exact number of periods per subject per class
#     for pid, (tname, subject, cls) in id_to_pair.items():
#         count = teacher_list[tname].subjects_by_class[cls][subject]
#         occurrences = []
#         for d in range(DAYS_PER_WEEK):
#             for p in range(PERIODS_PER_DAY):
#                 var = timetable[cls][d][p]
#                 b = model.NewBoolVar(f"occ_{cls}_{d}_{p}_{pid}")
#                 model.Add(var == pid).OnlyEnforceIf(b)
#                 model.Add(var != pid).OnlyEnforceIf(b.Not())
#                 occurrences.append(b)
#         model.Add(sum(occurrences) == count)

#     # Constraint 3: Limit same subject per day to max 2 periods
#     for cls in CLASSES:
#         for d in range(DAYS_PER_WEEK):
#             all_subjects = {
#                 subject
#                 for teacher in teacher_list.values()
#                 for subcls, subs in teacher.subjects_by_class.items()
#                 if subcls == cls for subject in subs
#             }
#             for subject in all_subjects:
#                 subject_ids = [
#                     pid for pid, (_, subj, c) in id_to_pair.items()
#                     if subj == subject and c == cls
#                 ]
#                 count_vars = []
#                 for p in range(PERIODS_PER_DAY):
#                     var = timetable[cls][d][p]
#                     for pid in subject_ids:
#                         b = model.NewBoolVar(f"{cls}_{d}_{p}_{subject}_{pid}")
#                         model.Add(var == pid).OnlyEnforceIf(b)
#                         model.Add(var != pid).OnlyEnforceIf(b.Not())
#                         count_vars.append(b)
#                 model.Add(sum(count_vars) <= 2)

#     # Constraint 4: Lab subjects in 2-period blocks
#     for pid, (tname, subject, cls) in id_to_pair.items():
#         if subject in teacher_list[tname].lab_subjects:
#             total = teacher_list[tname].subjects_by_class[cls][subject]
#             if total % 2 != 0:
#                 continue
#             num_blocks = total // 2
#             block_vars = []
#             for d in range(DAYS_PER_WEEK):
#                 for p in range(PERIODS_PER_DAY - 1):
#                     first = timetable[cls][d][p]
#                     second = timetable[cls][d][p + 1]
#                     is_block = model.NewBoolVar(f"lab_block_{cls}_{d}_{p}_{pid}")
#                     model.Add(first == pid).OnlyEnforceIf(is_block)
#                     model.Add(second == pid).OnlyEnforceIf(is_block)
#                     model.AddBoolOr([
#                         model.NewBoolVar(f"first_not_{pid}_{cls}_{d}_{p}"),
#                         model.NewBoolVar(f"second_not_{pid}_{cls}_{d}_{p}")
#                     ]).OnlyEnforceIf(is_block.Not())
#                     block_vars.append(is_block)
#             model.Add(sum(block_vars) == num_blocks)

#     # Constraint 5: Class teacher first period preference
#     for teacher in teacher_list.values():
#         if teacher.assigned_class and hasattr(teacher, 'main_subject'):
#             cls = teacher.assigned_class
#             main_subject = teacher.main_subject
#             main_subject_id = None
#             for pid, (tname, subject, class_name) in id_to_pair.items():
#                 if tname == teacher.name and subject == main_subject and class_name == cls:
#                     main_subject_id = pid
#                     break
#             if main_subject_id is not None and cls in teacher.subjects_by_class and main_subject in teacher.subjects_by_class[cls]:
#                 total_main_subject_periods = teacher.subjects_by_class[cls][main_subject]
#                 max_possible_first_periods = min(DAYS_PER_WEEK, total_main_subject_periods)
#                 first_period_main_subject = []
#                 for d in range(DAYS_PER_WEEK):
#                     is_first_period_main = model.NewBoolVar(f"{cls}_d{d}_first_main_{teacher.name}")
#                     model.Add(timetable[cls][d][0] == main_subject_id).OnlyEnforceIf(is_first_period_main)
#                     model.Add(timetable[cls][d][0] != main_subject_id).OnlyEnforceIf(is_first_period_main.Not())
#                     first_period_main_subject.append(is_first_period_main)
#                 if total_main_subject_periods >= DAYS_PER_WEEK:
#                     model.Add(sum(first_period_main_subject) == DAYS_PER_WEEK)
#                 else:
#                     model.Add(sum(first_period_main_subject) == total_main_subject_periods)

#     # Constraint 6: Ensure each period is filled
#     for cls in CLASSES:
#         for d in range(DAYS_PER_WEEK):
#             for p in range(PERIODS_PER_DAY):
#                 valid_assignments = []
#                 for pid in id_to_pair:
#                     if id_to_pair[pid][2] == cls:
#                         b = model.NewBoolVar(f"valid_{cls}_{d}_{p}_{pid}")
#                         model.Add(timetable[cls][d][p] == pid).OnlyEnforceIf(b)
#                         model.Add(timetable[cls][d][p] != pid).OnlyEnforceIf(b.Not())
#                         valid_assignments.append(b)
#                 if valid_assignments:
#                     model.Add(sum(valid_assignments) == 1)

#     solver = cp_model.CpSolver()
#     solver.parameters.max_time_in_seconds = 30
#     status = solver.Solve(model)

#     if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
#         class_tt = {}
#         for cls in CLASSES:
#             class_tt[cls] = []
#             for d in range(DAYS_PER_WEEK):
#                 row = []
#                 for p in range(PERIODS_PER_DAY):
#                     val = solver.Value(timetable[cls][d][p])
#                     if val in id_to_pair:
#                         teacher, subject, _ = id_to_pair[val]
#                         row.append(f"{subject}({teacher})")
#                     else:
#                         row.append("Free")
#                 class_tt[cls].append(row)

#         teacher_timetables = {}
#         for teacher_name, teacher in teacher_list.items():
#             teacher_tt = [["Free"] * PERIODS_PER_DAY for _ in range(DAYS_PER_WEEK)]
#             for cls in CLASSES:
#                 for d in range(DAYS_PER_WEEK):
#                     for p in range(PERIODS_PER_DAY):
#                         entry = class_tt[cls][d][p]
#                         if entry != "Free" and teacher_name in entry:
#                             subject = entry.split('(')[0]
#                             teacher_tt[d][p] = f"{subject} - {cls}"
#             teacher_timetables[teacher_name] = teacher_tt

#         return Timetable(data=class_tt), Timetable(data=teacher_timetables)

#     return Timetable(data={}), Timetable(data={})

from ortools.sat.python import cp_model
from models import Teacher, InputTeacher, Timetable
from config import CLASSES, DAYS_PER_WEEK, PERIODS_PER_DAY
from typing import List
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


def generate_from_input(input_teachers: List[InputTeacher]):
    teacher_list = convert_input_teachers(input_teachers)
    return generate_with_teacher_list(teacher_list)


def generate_with_teacher_list(teacher_list: dict):
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
              for p in range(PERIODS_PER_DAY)] for d in range(DAYS_PER_WEEK)]
        for cls in CLASSES
    }

    # Constraint 1: No teacher conflict
    for teacher in teacher_list.values():
        for d in range(DAYS_PER_WEEK):
            for p in range(PERIODS_PER_DAY):
                teacher_pairs = [(pid, cls) for pid, (tname, _, cls)
                                 in id_to_pair.items() if tname == teacher.name]
                class_assignments = []
                for pid, cls in teacher_pairs:
                    is_assigned = model.NewBoolVar(
                        f"{teacher.name}_{cls}_d{d}_p{p}_{pid}")
                    model.Add(timetable[cls][d][p]
                              == pid).OnlyEnforceIf(is_assigned)
                    model.Add(timetable[cls][d][p]
                              != pid).OnlyEnforceIf(is_assigned.Not())
                    class_assignments.append(is_assigned)
                if class_assignments:
                    model.Add(sum(class_assignments) <= 1)

    # Constraint 2: Assign exact number of periods per subject per class
    for pid, (tname, subject, cls) in id_to_pair.items():
        count = teacher_list[tname].subjects_by_class[cls][subject]
        occurrences = []
        for d in range(DAYS_PER_WEEK):
            for p in range(PERIODS_PER_DAY):
                var = timetable[cls][d][p]
                b = model.NewBoolVar(f"occ_{cls}_{d}_{p}_{pid}")
                model.Add(var == pid).OnlyEnforceIf(b)
                model.Add(var != pid).OnlyEnforceIf(b.Not())
                occurrences.append(b)
        model.Add(sum(occurrences) == count)

    # Constraint 3: Max 2 same subject per day
    for cls in CLASSES:
        for d in range(DAYS_PER_WEEK):
            all_subjects = {
                subject
                for teacher in teacher_list.values()
                for subcls, subs in teacher.subjects_by_class.items()
                if subcls == cls for subject in subs
            }
            for subject in all_subjects:
                subject_ids = [
                    pid for pid, (_, subj, c) in id_to_pair.items()
                    if subj == subject and c == cls
                ]
                count_vars = []
                for p in range(PERIODS_PER_DAY):
                    var = timetable[cls][d][p]
                    for pid in subject_ids:
                        b = model.NewBoolVar(
                            f"{cls}_{d}_{p}_{subject}_{pid}")
                        model.Add(var == pid).OnlyEnforceIf(b)
                        model.Add(var != pid).OnlyEnforceIf(b.Not())
                        count_vars.append(b)
                model.Add(sum(count_vars) <= 2)

    # Constraint 4: Lab subjects in 2-period blocks
    for pid, (tname, subject, cls) in id_to_pair.items():
        if subject in teacher_list[tname].lab_subjects:
            total = teacher_list[tname].subjects_by_class[cls][subject]
            if total % 2 != 0:
                continue
            num_blocks = total // 2
            block_vars = []
            for d in range(DAYS_PER_WEEK):
                for p in range(PERIODS_PER_DAY - 1):
                    first = timetable[cls][d][p]
                    second = timetable[cls][d][p + 1]
                    is_block = model.NewBoolVar(
                        f"lab_block_{cls}_{d}_{p}_{pid}")
                    model.Add(first == pid).OnlyEnforceIf(is_block)
                    model.Add(second == pid).OnlyEnforceIf(is_block)
                    block_vars.append(is_block)
            model.Add(sum(block_vars) == num_blocks)

    # Constraint 5: Class teacher first period for main subject
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
                for d in range(DAYS_PER_WEEK):
                    is_first = model.NewBoolVar(f"{cls}_d{d}_main_first_{teacher.name}")
                    model.Add(timetable[cls][d][0] == main_subject_id).OnlyEnforceIf(is_first)
                    model.Add(timetable[cls][d][0] != main_subject_id).OnlyEnforceIf(is_first.Not())
                    first_period_main_subject.append(is_first)
                model.Add(sum(first_period_main_subject) == min(DAYS_PER_WEEK, total_main_subject_periods))

    # Constraint 6: Every period must be filled
    for cls in CLASSES:
        for d in range(DAYS_PER_WEEK):
            for p in range(PERIODS_PER_DAY):
                valid_assignments = []
                for pid in id_to_pair:
                    if id_to_pair[pid][2] == cls:
                        b = model.NewBoolVar(f"valid_{cls}_{d}_{p}_{pid}")
                        model.Add(timetable[cls][d][p] == pid).OnlyEnforceIf(b)
                        model.Add(timetable[cls][d][p] != pid).OnlyEnforceIf(b.Not())
                        valid_assignments.append(b)
                if valid_assignments:
                    model.Add(sum(valid_assignments) == 1)

    # Solve the model
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        class_tt = {}
        for cls in CLASSES:
            class_tt[cls] = []
            for d in range(DAYS_PER_WEEK):
                row = []
                for p in range(PERIODS_PER_DAY):
                    val = solver.Value(timetable[cls][d][p])
                    if val in id_to_pair:
                        teacher, subject, _ = id_to_pair[val]
                        row.append(f"{subject}({teacher})")
                    else:
                        row.append("Free")
                class_tt[cls].append(row)

        teacher_timetables = {}
        for teacher_name, teacher in teacher_list.items():
            teacher_tt = [["Free"] * PERIODS_PER_DAY for _ in range(DAYS_PER_WEEK)]
            for cls in CLASSES:
                for d in range(DAYS_PER_WEEK):
                    for p in range(PERIODS_PER_DAY):
                        entry = class_tt[cls][d][p]
                        if entry != "Free" and teacher_name in entry:
                            subject = entry.split('(')[0]
                            teacher_tt[d][p] = f"{subject} - {cls}"
            teacher_timetables[teacher_name] = teacher_tt

        return Timetable(data=class_tt), Timetable(data=teacher_timetables)

    # Fallback if no solution
    return Timetable(data={}), Timetable(data={})
