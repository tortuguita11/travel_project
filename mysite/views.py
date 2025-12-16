from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from .models import Tour


def index(request):
    return HttpResponse("holiii index.")
#def home(request):
 
 #   return render(request, 'travels/home.html')

#class HomeView(TemplateView): template_name = 'travels/home.html'

def tours(request):
    tours_disponibles = [
        {
            'nombre': 'Tour a la Playa',
            'precio': 150,
            'duracion': '3 días',
            'descripcion': 'Disfruta del sol y el mar.'
        },
        {
            'nombre': 'Tour a la Montaña',
            'precio': 200,
            'duracion': '5 días',
            'descripcion': 'Aventura y naturaleza.'
        },
        {
            'nombre': 'Tour Cultural',
            'precio': 120,
            'duracion': '2 días',
            'descripcion': 'Conoce la historia y cultura.'
        }
    ]

    return render(request, 'travels/tours.html', {
        'tours': tours_disponibles
    })

def simple_tour_list(request):
    """Vista simple sin filtros complejos"""
    tours = Tour.objects.filter(is_active=True)[:12]  # Solo 12 tours
    
    # Datos simples para la plantilla
    context = {
        'tours': tours,
        'total_tours': tours.count(),
    }
    
    return render(request, 'tours/simple_list.html', context)

def home(request):
    """Página de inicio simple"""
    featured_tours = Tour.objects.filter(is_featured=True, is_active=True)[:3]
    
    context = {
        'featured_tours': featured_tours,
    }
    return render(request, 'home.html', context)