# Service Livraison

API REST pour la gestion des livraisons

## Endpoints

- `POST /api/deliveries` - Créer une livraison
- `GET /api/deliveries` - Lister toutes les livraisons
- `GET /api/deliveries/:orderId` - Récupérer une livraison
- `PUT /api/deliveries/:id/status` - Mettre à jour le statut

## Installation

```bash
npm install
npm start
```

Le service écoute sur le port 3003
