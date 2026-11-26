def hanoi_solver(n):
    rods = [list(range(n, 0, -1)), [], []]
    moves = [f'{rods[0]} {rods[1]} {rods[2]}']

    def move(count, source, target, auxiliary):
        if count == 0:
            return
        move(count - 1, source, auxiliary, target)
        rods[target].append(rods[source].pop())
        moves.append(f'{rods[0]} {rods[1]} {rods[2]}')
        move(count - 1, auxiliary, target, source)

    move(n, 0, 2, 1)
    return '\n'.join(moves)
