def arithmetic_arranger(problems, show_answers=False):
    if len(problems) > 5:
        return 'Error: Too many problems.'

    top = []
    bottom = []
    dashes = []
    answers = []

    for problem in problems:
        left, op, right = problem.split()

        if op not in ('+', '-'):
            return "Error: Operator must be '+' or '-'."
        if not (left.isdigit() and right.isdigit()):
            return 'Error: Numbers must only contain digits.'
        if len(left) > 4 or len(right) > 4:
            return 'Error: Numbers cannot be more than four digits.'

        width = max(len(left), len(right)) + 2
        top.append(left.rjust(width))
        bottom.append(op + right.rjust(width - 1))
        dashes.append('-' * width)

        if show_answers:
            result = int(left) + int(right) if op == '+' else int(left) - int(right)
            answers.append(str(result).rjust(width))

    lines = [
        '    '.join(top),
        '    '.join(bottom),
        '    '.join(dashes),
    ]
    if show_answers:
        lines.append('    '.join(answers))

    return '\n'.join(lines)
