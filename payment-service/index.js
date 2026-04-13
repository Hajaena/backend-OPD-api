const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3002;

app.use(express.json());

const payments = [];

app.post('/api/payments', async (req, res) => {
  const { orderId, customerId, amount } = req.body;

  const payment = {
    id: `PAY-${Date.now()}`,
    orderId,
    customerId,
    amount,
    status: 'PROCESSING',
    createdAt: new Date()
  };

  payments.push(payment);

  await new Promise(resolve => setTimeout(resolve, 500));

  payment.status = 'COMPLETED';
  payment.transactionId = `TXN-${Date.now()}`;

  try {
    await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, {
      status: 'PAID'
    });
  } catch (error) {
    console.error('Erreur mise à jour commande:', error.message);
  }

  res.status(201).json(payment);
});

app.get('/api/payments', (req, res) => {
  res.json(payments);
});

app.get('/api/payments/:orderId', (req, res) => {
  const payment = payments.find(p => p.orderId === req.params.orderId);
  if (!payment) {
    return res.status(404).json({ error: 'Paiement non trouvé' });
  }
  res.json(payment);
});

app.listen(PORT, () => {
  console.log(`Service Paiement en écoute sur le port ${PORT}`);
});
