from django.urls import path
from .views import (
    LivreListCreateAPIView, LivreRetrieveUpdateDestroyAPIView,
    EmpruntListCreateAPIView, EmpruntRetrieveUpdateDestroyAPIView,
    RendreLivreAPIView
)

urlpatterns = [
    path('livres/', LivreListCreateAPIView.as_view(), name='livre-list-create'),
    path('livres/<int:pk>/', LivreRetrieveUpdateDestroyAPIView.as_view(), name='livre-retrieve-update-destroy'),
    
    path('emprunts/', EmpruntListCreateAPIView.as_view(), name='emprunt-list-create'),
    path('emprunts/<int:pk>/', EmpruntRetrieveUpdateDestroyAPIView.as_view(), name='emprunt-retrieve-update-destroy'),
    
    path('emprunts/<int:pk>/rendre/', RendreLivreAPIView.as_view(), name='emprunt-rendre'),

]