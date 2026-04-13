# Systèmes de Web Services - Gestion de Commandes

Architecture SOA avec 3 micro-services orchestrés pour gérer le cycle de vie complet des commandes.

## Architecture

```
┌─────────────────────┐
│  Service Commande   │ (Port 3001)
│  - Créer commandes  │
│  - Lister/Récupérer │
├─────────────────────┤
        ↓
┌──────────────────────────────────────┐
│    Service Paiement (Port 3002)      │
│  - Traiter paiements                  │
│  - Callback vers service commande    │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│   Service Livraison (Port 3003)      │
│  - Gérer livraisons                   │
│  - Suivi avec numéro de tracking     │
└──────────────────────────────────────┘
```

## Services

1. **Order Service** - Gestion des commandes
   - Crée les commandes et initie le paiement automatiquement
   - Stocke l'historique des commandes
   - Gère les statuts (PENDING, PAID, IN_DELIVERY, COMPLETED)

2. **Payment Service** - Traitement des paiements
   - Traite les paiements
   - Met à jour automatiquement le statut de la commande
   - Génère les transactions

3. **Delivery Service** - Gestion des livraisons
   - Création de demandes de livraison
   - Suivi avec numéro de tracking unique
   - Mise à jour des statuts de livraison

## Installation et Démarrage

### Method 1: Docker Compose (Recommandé)

```bash
docker-compose up -d
```

### Method 2: Manuel

Terminal 1 - Service Paiement:
```bash
cd payment-service
npm install
npm start
```

Terminal 2 - Service Livraison:
```bash
cd delivery-service
npm install
npm start
```

Terminal 3 - Service Commande:
```bash
cd order-service
npm install
npm start
```

## Utilisation

### Créer une commande

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-123",
    "items": [
      {"name": "Produit A", "qty": 2, "price": 50}
    ],
    "totalAmount": 100
  }'
```

### Lister les commandes

```bash
curl http://localhost:3001/api/orders
```

### Récupérer une commande

```bash
curl http://localhost:3001/api/orders/{orderId}
```

### Créer une livraison

```bash
curl -X POST http://localhost:3003/api/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{orderId}",
    "customerId": "CUST-123",
    "address": "123 Rue Main, Antananarivo"
  }'
```

## Flux de Processus

1. Client crée une commande via Order Service
2. Order Service déclenche automatiquement un paiement via Payment Service
3. Payment Service traite le paiement et met à jour le statut de la commande
4. Delivery Service peut créer une livraison pour la commande payée
5. Delivery Service met à jour les statuts en temps réel

## Stack Technologique

- **Runtime**: Node.js
- **Framework**: Express.js
- **Communication**: HTTP/REST avec Axios
- **Gestion d'ID**: UUID
- **Orchestration**: Docker Compose

## Statuts des Commandes

- PENDING: Commande créée, en attente de paiement
- PAID: Paiement reçu
- IN_DELIVERY: En cours de livraison
- COMPLETED: Livraison effectuée
- PAYMENT_FAILED: Erreur de paiement

## Statuts de Livraison

- PENDING: Livraison créée, en attente
- IN_TRANSIT: En cours de livraison
- DELIVERED: Livrée
- FAILED: Échec de livraison

## Notes

- Les services utilisent une mémoire en local (données perdues au redémarrage)
- Idéal pour développement et prototypage
- Pour la production, ajouter une base de données persistante (MongoDB, PostgreSQL)
