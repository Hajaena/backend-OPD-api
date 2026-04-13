# Flux de Processus BPMN

## Processus Principal: Commande → Paiement → Livraison

```
START
  │
  ├──> [Service Commande]
  │    └─ POST /api/orders
  │       │ Créer ordre
  │       └─ Récupérer: {id, customerId, items, totalAmount, status: PENDING}
  │
  ├──> [Service Paiement] (Appelé automatiquement)
  │    └─ POST /api/payments
  │       │ Traiter paiement
  │       │ (Simulation: 500ms delay)
  │       └─ Mettre à jour OrderStatus → PAID
  │
  ├──> [Service Livraison] (Appelé par le client)
  │    └─ POST /api/deliveries
  │       │ Créer demande de livraison
  │       │ Générer tracking number
  │       └─ Mettre à jour OrderStatus → IN_DELIVERY
  │
  ├──> [Suivi]
  │    ├─ GET /api/orders/{id}
  │    ├─ GET /api/deliveries/{orderId}
  │    └─ GET /api/payments/{orderId}
  │
  └──> END

```

## Modèle de Données

### Orders
```javascript
{
  id: UUID,
  customerId: String,
  items: [
    {
      name: String,
      qty: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: PENDING | PAID | IN_DELIVERY | COMPLETED | PAYMENT_FAILED,
  createdAt: DateTime
}
```

### Payments
```javascript
{
  id: String (PAY-{timestamp}),
  orderId: UUID,
  customerId: String,
  amount: Number,
  status: PROCESSING | COMPLETED,
  transactionId: String,
  createdAt: DateTime
}
```

### Deliveries
```javascript
{
  id: String (DEL-{timestamp}),
  orderId: UUID,
  customerId: String,
  address: String,
  status: PENDING | IN_TRANSIT | DELIVERED | FAILED,
  trackingNumber: String (TRACK-{randomCode}),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## Interactions Entre Services

### Order Service → Payment Service
- L'ordre créé déclenche automatiquement un paiement
- Payment Service répond avec le statut du paiement
- Order Service met à jour son statut basé sur la réponse

### Order Service ← Payment Service
- Payment Service met à jour le statut de la commande (PAID)
- Via PUT /api/orders/{id}/status

### Order Service ← Delivery Service
- Delivery Service met à jour le statut de la commande (IN_DELIVERY)
- Via PUT /api/orders/{id}/status

## Cas d'Utilisation

### Scénario 1: Commande Réussie
1. Client crée commande → Order Service
2. Order Service crée paiement → Payment Service
3. Payment Service traite et marque comme COMPLETED
4. Order Service reçoit et marque commande PAID
5. Client crée livraison → Delivery Service
6. Delivery Service crée tracking et marque commande IN_DELIVERY

### Scénario 2: Erreur de Paiement
1. Client crée commande → Order Service
2. Order Service tente créer paiement → Payment Service (TIMEOUT/ERREUR)
3. Order Service marque commande PAYMENT_FAILED
4. Pas de livraison possible

### Scénario 3: Suivi Complet
1. Client peut récupérer statut commande à tout moment
2. Client peut voir détails paiement
3. Client peut voir détails livraison avec numéro de tracking
