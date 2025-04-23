# Application Mobile - LibraryApp

Cette application mobile React Native permet aux utilisateurs de gérer une bibliothèque : emprunter, retourner des livres, consulter leur profil et plus encore.

## Installation & Exécution

### 1. Cloner le projet

```bash
git clone https://github.com/WissalEnnajah/EmpruntLivre.git
cd frontend/LibraryApp
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Ajouter votre adresse IP

Dans votre CMD, lancer la commande `ipconfig` et coller votre adresse dans la page `services/api.ts`
Exemple: `http://192.168.1.126:8000/api`

### 4. Lancer l'application

#### Si vous utilisez Expo :

```bash
npx expo start
```

#### Si vous utilisez React Native CLI :

```bash
npx react-native run-android
# ou
npx react-native run-ios
```

## Authentification

- L'authentification est basée sur JWT.
- Les tokens sont stockés dans `AsyncStorage`.
- En cas de déconnexion, un appel à `auth/logout/` est effectué pour révoquer le token refresh.

## Structure

- `BooksScreen`: Liste des livres
- `MyBorrowsScreen`: Historique personnel des emprunts
- `AdminPanelScreen`: Vue des emprunts pour l’admin
- `ProfileScreen`: Informations utilisateur + édition
- `MainTabs`: Navigation avec badges dynamiques

## Astuce

- Pour actualiser la liste des livres/emprunts, revenir sur l’onglet correspondant ou tirer vers le bas.
- Les couleurs changent automatiquement selon le rôle (utilisateur/admin).
