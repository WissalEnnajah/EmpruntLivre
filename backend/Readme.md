# Backend - Library API

Ce backend Django REST Framework permet de gérer les livres, emprunts, utilisateurs, authentification JWT, etc.

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/WissalEnnajah/EmpruntLivre.git
cd backend
```

### 2. Créer un environnement virtuel

```bash
python -m venv .venv
source venv/bin/activate  # (Linux/macOS)
.venv\Scripts\activate   # (Windows)
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Appliquer les migrations

```bash
python manage.py migrate
```

### 5. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 6. Lancer le serveur

```bash
python manage.py runserver
```

## Endpoints API

| Endpoint                   | Méthode | Description                         |
|----------------------------|---------|-------------------------------------|
| `/auth/register/`         | POST    | Créer un utilisateur                |
| `/auth/login/`            | POST    | Connexion (JWT)                     |
| `/auth/logout/`           | POST    | Déconnexion                         |
| `/auth/me/`               | GET/PUT | Infos et mise à jour utilisateur    |
| `/auth/change-password/`  | POST    | Changer le mot de passe             |
| `/livres/`                | CRUD    | Livres                              |
| `/emprunts/`              | CRUD    | Emprunts                            |
| `/emprunts/<id>/rendre/`  | POST    | Retourner un livre                  |

## Important

- Les permissions sont gérées avec `IsAuthenticated`.
- Utilisez `drf-yasg` ou Postman pour tester les endpoints.
