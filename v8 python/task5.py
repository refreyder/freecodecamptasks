import copy
import random


class Hat:
    def __init__(self, **kwargs):
        self.contents = [color for color, count in kwargs.items() for _ in range(count)]

    def draw(self, num_balls):
        if num_balls >= len(self.contents):
            drawn = self.contents.copy()
            self.contents.clear()
            return drawn
        drawn = []
        for _ in range(num_balls):
            idx = random.randrange(len(self.contents))
            drawn.append(self.contents.pop(idx))
        return drawn


def experiment(hat, expected_balls, num_balls_drawn, num_experiments):
    success_count = 0
    for _ in range(num_experiments):
        hat_copy = copy.deepcopy(hat)
        drawn = hat_copy.draw(num_balls_drawn)
        if all(drawn.count(color) >= count for color, count in expected_balls.items()):
            success_count += 1
    return success_count / num_experiments
