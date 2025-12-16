# tours/models.py
from django.db import models

class Tour(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nombre del Tour")
    slug = models.SlugField(unique=True, blank=True)
    short_description = models.CharField(max_length=300)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    start_date = models.DateField()
    duration_days = models.IntegerField()
    
    total_seats = models.IntegerField()
    booked_seats = models.IntegerField(default=0)
    
    main_image = models.ImageField(upload_to='tours/main/', blank=True, null=True)
    
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def available_seats(self):
        return self.total_seats - self.booked_seats
    
    def __str__(self):
        return self.name