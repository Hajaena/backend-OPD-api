@echo off
setlocal enabledelayedexpansion

echo Installation des dependances...

cd order-service
call npm install
cd ..

cd payment-service
call npm install
cd ..

cd delivery-service
call npm install
cd ..

echo Dependances installees avec succes!
