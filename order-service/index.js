const express = require('express');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Joi = require('joi');

const app = express();
const PORT = 3001;

app.use(compression());
app.use(express.json({ limit: '10mb' }));

const orders = new Map();
const axiosInstance = axios.create({
  timeout: 5000,
  httpAgent: { keepAlive: true },
  httpsAgent: { keepAlive: true }
});

const retryRequest = async (fn, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 100 * Math.pow(2, i)));
    }
  }
};

const validateOrder = (data) => {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      qty: Joi.number().positive().required(),
      price: Joi.number().positive().required()
    })).min(1).required(),
    totalAmount: Joi.number().positive().required()
  });
  return schema.validate(data);
};

app.post('/api/orders', async (req, res) => {
  const { error, value } = validateOrder(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { customerId, items, totalAmount } = value;
  const orderId = uuidv4();

  const order = {
    id: orderId,
    customerId,
    items,
    totalAmount,
    status: 'PENDING',
    createdAt: Date.now()
  };

  orders.set(orderId, order);

  try {
    await retryRequest(() =>
      axiosInstance.post('http://localhost:3002/api/payments', {
        orderId,
        customerId,
        amount: totalAmount
      })
    );
    order.status = 'PAID';
  } catch (err) {
    order.status = 'PAYMENT_FAILED';
  }

  res.status(201).json(order);
});

app.get('/api/orders', (req, res) => {
  const ordersArray = Array.from(orders.values());
  res.json(ordersArray);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée' });
  }
  res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée' });
  }

  order.status = status;
  order.updatedAt = Date.now();
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Service Commande en écoute sur le port ${PORT}`);
});
