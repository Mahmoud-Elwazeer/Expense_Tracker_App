from rest_framework import serializers
from .models import Category, Expense

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ExpenseSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "amount", "category", "category_detail", "date", "description", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "user"]
