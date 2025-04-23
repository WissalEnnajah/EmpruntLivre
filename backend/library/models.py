from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Livre(models.Model):
    titre = models.CharField(max_length=200, unique=True)
    auteur = models.CharField(max_length=100)
    disponible = models.BooleanField(default=True)
    date_publication = models.DateField()

    def __str__(self):
        return f"{self.titre}({self.auteur})"

class Emprunt(models.Model):
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE)
    livre = models.ForeignKey(Livre, on_delete=models.CASCADE)
    date_emprunt = models.DateField(auto_now_add=True)
    date_retour = models.DateField(null=True, blank=True)
    date_retour_prevue = models.DateField(null=True, blank=True)

    

    def __str__(self):
        return f"{self.utilisateur.username} - {self.livre.titre}"