const express = require('express');
const compression = require('compression');
const axios = require('axios');
const Joi = require('joi');

const app = express();
const PORT = 3002;

app.use(compression());
app.use(express.json({ limit: '10mb' }));

const payments = new Map();
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

const validatePayment = (data) => {
  const schema = Joi.object({
    orderId: Joi.string().required(),
    customerId: Joi.string().required(),
    amount: Joi.number().positive().required()
  });
  return schema.validate(data);
};

app.post('/api/payments', async (req, res) => {
  const { error, value } = validatePayment(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { orderId, customerId, amount } = value;
  const paymentId = `PAY-${Date.now()}`;

  const payment = {
    id: paymentId,
    orderId,
    customerId,
    amount,
    status: 'PROCESSING',
    createdAt: Date.now()
  };

  payments.set(paymentId, payment);

  setImmediate(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      payment.status = 'COMPLETED';
      payment.transactionId = `TXN-${Date.now()}`;

      await retryRequest(() =>
        axiosInstance.put(`http://localhost:3001/api/orders/${orderId}/status`, {
          status: 'PAID'
        })
      ).catch(() => {});

    } catch (err) {
      payment.status = 'FAILED';
    }
  });

  res.status(201).json(payment);
});

app.get('/api/payments', (req, res) => {
  const paymentsArray = Array.from(payments.values());
  res.json(paymentsArray);
});

app.get('/api/payments/:orderId', (req, res) => {
  const payment = Array.from(payments.values()).find(p => p.orderId === req.params.orderId);
  if (!payment) {
    return res.status(404).json({ error: 'Paiement non trouvé' });
  }
  res.json(payment);
});

app.listen(PORT, () => {
  console.log(`Service Paiement en écoute sur le port ${PORT}`);
});
