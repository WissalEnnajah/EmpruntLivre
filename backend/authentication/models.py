from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.username}({self.email})"