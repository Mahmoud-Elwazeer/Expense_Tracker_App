from rest_framework import viewsets, permissions, filters
from .models import Category, Expense
from .serializers import CategorySerializer, ExpenseSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, DateFilter, CharFilter

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Category.objects.none()
        return Category.objects.filter(user=self.request.user) | Category.objects.filter(user__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseFilter(FilterSet):
    start_date = DateFilter(field_name="date", lookup_expr="gte")
    end_date = DateFilter(field_name="date", lookup_expr="lte")
    category = CharFilter(field_name="category__name", lookup_expr="iexact")

    class Meta:
        model = Expense
        fields = ["category", "start_date", "end_date"]

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ExpenseFilter
    ordering_fields = ["date", "amount"]
    ordering = ['-date']

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):  # for drf-spectacular schema generation
            return Expense.objects.none()
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def monthly_report(self, request):
        today = now().date()
        month = today.month
        year = today.year

        expenses = self.get_queryset().filter(date__year=year, date__month=month)
        total = expenses.aggregate(total_amount=Sum("amount"))["total_amount"] or 0

        return Response({
            "month": f"{year}-{month}",
            "total_expenses": total,
            "expenses": ExpenseSerializer(expenses, many=True).data
        })
