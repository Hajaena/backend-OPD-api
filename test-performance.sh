#!/bin/bash

echo "Test de performance API..."
echo ""

BASE_URL="http://localhost:3001"
ORDER_ID=""

test_create_order() {
  echo "📝 Test 1: Créer une commande..."
  response=$(curl -s -X POST "$BASE_URL/api/orders" \
    -H "Content-Type: application/json" \
    -d '{
      "customerId": "CUST-001",
      "items": [
        {"name": "Laptop", "qty": 1, "price": 1000},
        {"name": "Mouse", "qty": 2, "price": 25}
      ],
      "totalAmount": 1050
    }')
  
  ORDER_ID=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "✓ Commande créée: $ORDER_ID"
  echo "$response" | jq '.' 2>/dev/null || echo "$response"
  echo ""
}

test_get_order() {
  echo "🔍 Test 2: Récupérer la commande..."
  curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
}

test_list_orders() {
  echo "📋 Test 3: Lister toutes les commandes..."
  curl -s -X GET "$BASE_URL/api/orders" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
}

test_invalid_order() {
  echo "❌ Test 4: Tester validation (requête invalide)..."
  curl -s -X POST "$BASE_URL/api/orders" \
    -H "Content-Type: application/json" \
    -d '{
      "customerId": "CUST-002",
      "items": [],
      "totalAmount": 0
    }' | jq '.'
  echo ""
}

benchmark_lookups() {
  echo "⚡ Test 5: Benchmark 100 recherches consécutives..."
  start=$(date +%s%N)
  
  for i in {1..100}; do
    curl -s -X GET "$BASE_URL/api/orders/$ORDER_ID" > /dev/null
  done
  
  end=$(date +%s%N)
  duration=$((($end - $start) / 1000000))
  avg=$(($duration / 100))
  
  echo "✓ 100 requêtes en ${duration}ms (moyenne: ${avg}ms par requête)"
  echo ""
}

if [ -z "$1" ]; then
  test_create_order
  sleep 1
  test_get_order
  sleep 1
  test_list_orders
  sleep 1
  test_invalid_order
  sleep 1
  benchmark_lookups
else
  case $1 in
    create) test_create_order ;;
    get) test_get_order ;;
    list) test_list_orders ;;
    invalid) test_invalid_order ;;
    benchmark) benchmark_lookups ;;
    *) echo "Usage: $0 [create|get|list|invalid|benchmark]" ;;
  esac
fi
