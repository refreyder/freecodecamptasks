class Category:
    def __init__(self, name):
        self.name = name
        self.ledger = []

    def deposit(self, amount, description=''):
        self.ledger.append({'amount': amount, 'description': description})

    def withdraw(self, amount, description=''):
        if self.check_funds(amount):
            self.ledger.append({'amount': -amount, 'description': description})
            return True
        return False

    def get_balance(self):
        return sum(item['amount'] for item in self.ledger)

    def transfer(self, amount, category):
        if self.check_funds(amount):
            self.withdraw(amount, f'Transfer to {category.name}')
            category.deposit(amount, f'Transfer from {self.name}')
            return True
        return False

    def check_funds(self, amount):
        return amount <= self.get_balance()

    def __str__(self):
        title = f'{self.name:*^30}'
        lines = [title]
        for item in self.ledger:
            desc = item['description'][:23]
            amt = f"{item['amount']:.2f}"[:7]
            lines.append(f'{desc:<23}{amt:>7}')
        lines.append(f'Total: {self.get_balance():.2f}')
        return '\n'.join(lines)


def create_spend_chart(categories):
    spent = []
    for category in categories:
        total = sum(-item['amount'] for item in category.ledger if item['amount'] < 0)
        spent.append(total)

    total_spent = sum(spent)
    percentages = [
        int((s / total_spent) * 100 // 10) * 10 if total_spent > 0 else 0
        for s in spent
    ]

    lines = ['Percentage spent by category']
    for level in range(100, -1, -10):
        row = f'{level:>3}| '
        for p in percentages:
            row += 'o  ' if p >= level else '   '
        lines.append(row)

    lines.append('    ' + '-' * (len(categories) * 3 + 1))

    max_len = max((len(c.name) for c in categories), default=0)
    for i in range(max_len):
        row = '     '
        for category in categories:
            char = category.name[i] if i < len(category.name) else ' '
            row += f'{char}  '
        lines.append(row)

    return '\n'.join(lines)
