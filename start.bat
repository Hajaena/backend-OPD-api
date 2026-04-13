@echo off
setlocal enabledelayedexpansion

echo Demarrage des services...

start "Payment Service" cmd /k "cd payment-service && npm start"
timeout /t 2
start "Delivery Service" cmd /k "cd delivery-service && npm start"
timeout /t 2
start "Order Service" cmd /k "cd order-service && npm start"

echo.
echo Services demarres:
echo - Order Service: http://localhost:3001
echo - Payment Service: http://localhost:3002
echo - Delivery Service: http://localhost:3003
echo.
echo Fermez les fenetres de commande pour arreter les services
