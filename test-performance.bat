@echo off
setlocal enabledelayedexpansion

echo Test de performance API...
echo.

set BASE_URL=http://localhost:3001
set ORDER_ID=

if "%1%"=="" goto run_all

goto %1%

:run_all
echo Execution de tous les tests...
goto create_order

:create_order
echo 📝 Test 1: Creer une commande...
for /f "tokens=*" %%i in ('powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/api/orders' -Method POST -ContentType 'application/json' -Body '{\"customerId\":\"CUST-001\",\"items\":[{\"name\":\"Laptop\",\"qty\":1,\"price\":1000}],\"totalAmount\":1000}' | ConvertTo-Json"') do (
  set ORDER_ID=%%i
)
if "%1%"=="create" goto end
timeout /t 1
goto get_order

:get_order
echo 🔍 Test 2: Recuperer la commande...
powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/api/orders/%ORDER_ID%' -Method GET | ConvertTo-Json"
if "%1%"=="get" goto end
timeout /t 1
goto list_orders

:list_orders
echo 📋 Test 3: Lister toutes les commandes...
powershell -Command "Invoke-RestMethod -Uri '%BASE_URL%/api/orders' -Method GET | ConvertTo-Json"
if "%1%"=="list" goto end
timeout /t 1
goto end

:end
echo.
echo Tests termines!
