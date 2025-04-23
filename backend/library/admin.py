from django.contrib import admin
from .models import Livre, Emprunt

@admin.register(Livre)
class LivreAdmin(admin.ModelAdmin):
    list_display = ('id', 'titre', 'auteur', 'date_publication', 'disponible')
    list_filter = ('disponible', 'date_publication')
    search_fields = ('titre', 'auteur')
    ordering = ('-date_publication',)

@admin.register(Emprunt)
class EmpruntAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'livre', 'date_emprunt', 'date_retour')
    list_filter = ('date_emprunt', 'date_retour')
    search_fields = ('utilisateur__username', 'livre__titre')
    date_hierarchy = 'date_emprunt'
