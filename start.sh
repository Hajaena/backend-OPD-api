#!/bin/bash

echo "Démarrage des services..."

cd order-service && npm install &
cd ../payment-service && npm install &
cd ../delivery-service && npm install &

wait

echo "Installation terminée. Démarrage des services..."

cd payment-service && npm start &
PAYMENT_PID=$!

cd ../delivery-service && npm start &
DELIVERY_PID=$!

cd ../order-service && npm start &
ORDER_PID=$!

echo "Services démarrés:"
echo "- Order Service: http://localhost:3001 (PID: $ORDER_PID)"
echo "- Payment Service: http://localhost:3002 (PID: $PAYMENT_PID)"
echo "- Delivery Service: http://localhost:3003 (PID: $DELIVERY_PID)"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les services"

trap "kill $ORDER_PID $PAYMENT_PID $DELIVERY_PID" EXIT

wait
