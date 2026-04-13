const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3003;

app.use(express.json());

const deliveries = [];

app.post('/api/deliveries', async (req, res) => {
  const { orderId, customerId, address } = req.body;

  const delivery = {
    id: `DEL-${Date.now()}`,
    orderId,
    customerId,
    address,
    status: 'PENDING',
    trackingNumber: `TRACK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    createdAt: new Date()
  };

  deliveries.push(delivery);

  try {
    await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, {
      status: 'IN_DELIVERY'
    });
  } catch (error) {
    console.error('Erreur mise à jour commande:', error.message);
  }

  res.status(201).json(delivery);
});

app.get('/api/deliveries', (req, res) => {
  res.json(deliveries);
});

app.get('/api/deliveries/:orderId', (req, res) => {
  const delivery = deliveries.find(d => d.orderId === req.params.orderId);
  if (!delivery) {
    return res.status(404).json({ error: 'Livraison non trouvée' });
  }
  res.json(delivery);
});

app.put('/api/deliveries/:id/status', (req, res) => {
  const { status } = req.body;
  const delivery = deliveries.find(d => d.id === req.params.id);

  if (!delivery) {
    return res.status(404).json({ error: 'Livraison non trouvée' });
  }

  delivery.status = status;
  delivery.updatedAt = new Date();

  res.json(delivery);
});

app.listen(PORT, () => {
  console.log(`Service Livraison en écoute sur le port ${PORT}`);
});
