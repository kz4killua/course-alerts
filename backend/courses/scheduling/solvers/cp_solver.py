import itertools

from ortools.sat.python import cp_model

from courses.scheduling.time_bitmap import TimeBitmap


def get_valid_time_assignments(course_codes: list[str], combinations: dict[str, set[TimeBitmap]], time_limit: int = None, max_solutions: int = None):
    """Generate valid schedules using constraint programming."""

    model = cp_model.CpModel()

    # Create a variable for each assignment of a course to a section
    variables = {}
    for course_code in course_codes:
        for option in combinations[course_code]:
            variables[(course_code, option)] = model.new_bool_var(f'{course_code}-{option}')

    # Constraint 1: Each course code must have exactly one selected option
    for course_code in course_codes:
        model.add_exactly_one(
            variables[(course_code, option)] for option in combinations[course_code]
        )

    # Constraint 2: Selected options must not overlap in time
    for c1, c2 in itertools.product(course_codes, repeat=2):
        if c1 != c2:
            for t1, t2 in itertools.product(combinations[c1], combinations[c2]):
                if t1 & t2:
                    model.add(
                        (variables[c1, t1] + variables[c2, t2]) <= 1
                    )

    model.validate()

    # Set up the solver
    solver = cp_model.CpSolver()
    solver.parameters.enumerate_all_solutions = True
    if time_limit is not None:
        solver.parameters.max_time_in_seconds = time_limit
    callback = SolverCallback(variables, max_solutions)

    # Solve the model
    status = solver.solve(model, callback)

    return callback.solutions


class SolverCallback(cp_model.CpSolverSolutionCallback):
    
    def __init__(self, variables, max_solutions) -> None:
        super().__init__()
        self.variables = variables
        self.solutions = []
        self.max_solutions = max_solutions

    def on_solution_callback(self) -> None:
        solution = dict()

        for (course_code, option), variable in self.variables.items():
            if self.value(variable):
                solution[course_code] = option

        self.solutions.append(solution)

        if self.max_solutions is not None and len(self.solutions) >= self.max_solutions:
            self.stop_search()
