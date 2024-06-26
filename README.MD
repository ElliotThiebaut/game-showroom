# Game Showroom

Site web permettant de présenter de nouveaux produits en vidéo tout en récoltant l'avis des usagers !

## Structure

### Interface client

Dans le dossier `client` se trouve l'application Vue responsable du frontend pour les visiteurs/clients.

### Interface admin

Dans le dossier `admin` se trouve l'application Vue responsable du frontend du CMS pour les administrateurs.

### Backend

Dans le dossier `api` se trouve l'application NodeJS Fastify qui gère le backend de tout le service.

## Déploiement

Le déploiement du service se fait via le fichier `docker-compose.yml` qui créer les trois containers docker.

Le fichier `.env` permet de configurer toutes les variables nécessaires :

```dotenv
VITE_DB_GATHERING_KEY=
DB_GATHERING_ADMIN_KEY=

VOLUME_PATH_DB=

API_PORT=
CLIENT_PORT=
ADMIN_PORT=

DB_HOST=
IMAGE_CDN_KEY=
VIDEO_CDN_KEY=

VITE_API_URL=
```
