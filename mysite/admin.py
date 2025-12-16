# tours/admin.py
from django.contrib import admin
from .models import Tour

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'start_date', 'is_featured', 'is_active']
    list_filter = ['is_featured', 'is_active', 'start_date']
    search_fields = ['name', 'short_description']