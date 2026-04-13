const express = require('express');
const compression = require('compression');
const axios = require('axios');
const Joi = require('joi');

const app = express();
const PORT = 3003;

app.use(compression());
app.use(express.json({ limit: '10mb' }));

const deliveries = new Map();
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

const validateDelivery = (data) => {
  const schema = Joi.object({
    orderId: Joi.string().required(),
    customerId: Joi.string().required(),
    address: Joi.string().min(5).required()
  });
  return schema.validate(data);
};

app.post('/api/deliveries', async (req, res) => {
  const { error, value } = validateDelivery(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { orderId, customerId, address } = value;
  const deliveryId = `DEL-${Date.now()}`;

  const delivery = {
    id: deliveryId,
    orderId,
    customerId,
    address,
    status: 'PENDING',
    trackingNumber: `TRACK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    createdAt: Date.now()
  };

  deliveries.set(deliveryId, delivery);

  retryRequest(() =>
    axiosInstance.put(`http://localhost:3001/api/orders/${orderId}/status`, {
      status: 'IN_DELIVERY'
    })
  ).catch(() => {});

  res.status(201).json(delivery);
});

app.get('/api/deliveries', (req, res) => {
  const deliveriesArray = Array.from(deliveries.values());
  res.json(deliveriesArray);
});

app.get('/api/deliveries/:orderId', (req, res) => {
  const delivery = Array.from(deliveries.values()).find(d => d.orderId === req.params.orderId);
  if (!delivery) {
    return res.status(404).json({ error: 'Livraison non trouvée' });
  }
  res.json(delivery);
});

app.put('/api/deliveries/:id/status', (req, res) => {
  const { status } = req.body;
  const delivery = deliveries.get(req.params.id);

  if (!delivery) {
    return res.status(404).json({ error: 'Livraison non trouvée' });
  }

  delivery.status = status;
  delivery.updatedAt = Date.now();
  res.json(delivery);
});

app.listen(PORT, () => {
  console.log(`Service Livraison en écoute sur le port ${PORT}`);
});
