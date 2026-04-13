#!/bin/bash

echo "Installation des dépendances..."

cd order-service && npm install
cd ../payment-service && npm install
cd ../delivery-service && npm install

echo "Dépendances installées avec succès!"
