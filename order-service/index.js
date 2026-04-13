const express = require('express');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(express.json());

const orders = [];

app.post('/api/orders', async (req, res) => {
  const { customerId, items, totalAmount } = req.body;

  const order = {
    id: uuidv4(),
    customerId,
    items,
    totalAmount,
    status: 'PENDING',
    createdAt: new Date()
  };

  orders.push(order);

  try {
    const paymentResponse = await axios.post('http://localhost:3002/api/payments', {
      orderId: order.id,
      customerId,
      amount: totalAmount
    });

    if (paymentResponse.data.status === 'COMPLETED') {
      order.status = 'PAID';
    }
  } catch (error) {
    console.error('Erreur paiement:', error.message);
    order.status = 'PAYMENT_FAILED';
  }

  res.status(201).json(order);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée' });
  }
  res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée' });
  }

  order.status = status;
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Service Commande en écoute sur le port ${PORT}`);
});
