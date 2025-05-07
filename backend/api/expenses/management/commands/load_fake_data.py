from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
from api.expenses.models import Category, Expense
import random
from datetime import timedelta, datetime

User = get_user_model()

class Command(BaseCommand):
    help = "Load database with fake categories and expenses"

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Get or create a demo user
        user, created = User.objects.get_or_create(email='demo@example.com', defaults={'first_name': 'Demo', 'last_name': 'User', 'password': 'pass1234'})

        # Create categories
        categories = []
        for _ in range(5):
            name = fake.word().capitalize()
            category, _ = Category.objects.get_or_create(user=user, name=name)
            categories.append(category)
        self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} categories'))

        # Create expenses
        for _ in range(30):
            expense = Expense.objects.create(
                user=user,
                category=random.choice(categories),
                amount=round(random.uniform(10, 500), 2),
                date=fake.date_between(start_date="-2m", end_date="today"),
                description=fake.sentence(nb_words=6)
            )
        self.stdout.write(self.style.SUCCESS(f'Created 30 fake expenses'))
