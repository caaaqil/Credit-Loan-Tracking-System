# API Testing Examples

This document contains curl commands to test all API endpoints.

## Setup

First, register and login to get an authentication token:

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token from the response for subsequent requests!**

## Shop Endpoints

### Create Shop

```bash
curl -X POST http://localhost:5000/api/shops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "ABC Electronics",
    "ownerName": "Ahmed Ali",
    "phone": "1234567890",
    "village": "Downtown Market",
    "category": "Retail"
  }'
```

### Get All Shops

```bash
curl -X GET "http://localhost:5000/api/shops?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Shop by ID

```bash
curl -X GET http://localhost:5000/api/shops/SHOP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Shop

```bash
curl -X PUT http://localhost:5000/api/shops/SHOP_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "ABC Electronics Updated",
    "phone": "9876543210"
  }'
```

### Delete Shop (Soft Delete)

```bash
curl -X DELETE http://localhost:5000/api/shops/SHOP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Customer Endpoints

### Create Customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mohamed Hassan",
    "phone": "5551234567",
    "village": "Suburb Area",
    "category": "Regular"
  }'
```

### Get All Customers

```bash
curl -X GET "http://localhost:5000/api/customers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Customer by ID

```bash
curl -X GET http://localhost:5000/api/customers/CUSTOMER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Loan Endpoints

### Create Loan (From Shop)

```bash
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "direction": "FROM_SHOP",
    "partyId": "SHOP_ID",
    "partyModel": "Shop",
    "orderLetter": "ORD-001",
    "amount": 5000,
    "month": "December",
    "year": 2024
  }'
```

### Create Loan (To Customer)

```bash
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "direction": "TO_CUSTOMER",
    "partyId": "CUSTOMER_ID",
    "partyModel": "Customer",
    "orderLetter": "ORD-002",
    "amount": 3000,
    "month": "December",
    "year": 2024
  }'
```

### Get All Loans

```bash
curl -X GET "http://localhost:5000/api/loans?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Loans for Specific Party

```bash
curl -X GET "http://localhost:5000/api/loans?partyId=SHOP_ID&direction=FROM_SHOP" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Payment Endpoints

### Create Payment (To Shop)

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "direction": "FROM_SHOP",
    "partyId": "SHOP_ID",
    "partyModel": "Shop",
    "amountPaid": 1000,
    "paymentNumber": "PAY-001",
    "datePaid": "2024-12-02"
  }'
```

### Create Payment (From Customer)

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "direction": "TO_CUSTOMER",
    "partyId": "CUSTOMER_ID",
    "partyModel": "Customer",
    "amountPaid": 500,
    "paymentNumber": "PAY-002",
    "datePaid": "2024-12-02"
  }'
```

### Get All Payments

```bash
curl -X GET "http://localhost:5000/api/payments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## File Upload Endpoint

### Upload Files

```bash
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.pdf" \
  -F "partyModel=Shop" \
  -F "partyId=SHOP_ID" \
  -F "type=loan"
```

## Reports Endpoint

### Get Monthly Report

```bash
curl -X GET "http://localhost:5000/api/reports/monthly?month=December&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Complete Workflow Example

Here's a complete workflow to test the system:

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

# 2. Create a shop
SHOP_ID=$(curl -s -X POST http://localhost:5000/api/shops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Shop","ownerName":"John Doe","phone":"1234567890","village":"Downtown","category":"Retail"}' \
  | jq -r '.shop._id')

# 3. Create a customer
CUSTOMER_ID=$(curl -s -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Jane Smith","phone":"0987654321","village":"Uptown","category":"Regular"}' \
  | jq -r '.customer._id')

# 4. Create a loan from shop
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"direction\":\"FROM_SHOP\",\"partyId\":\"$SHOP_ID\",\"partyModel\":\"Shop\",\"orderLetter\":\"ORD-001\",\"amount\":5000,\"month\":\"December\",\"year\":2024}"

# 5. Create a loan to customer
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"direction\":\"TO_CUSTOMER\",\"partyId\":\"$CUSTOMER_ID\",\"partyModel\":\"Customer\",\"orderLetter\":\"ORD-002\",\"amount\":3000,\"month\":\"December\",\"year\":2024}"

# 6. Make a payment to shop
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"direction\":\"FROM_SHOP\",\"partyId\":\"$SHOP_ID\",\"partyModel\":\"Shop\",\"amountPaid\":1000,\"paymentNumber\":\"PAY-001\"}"

# 7. Get monthly report
curl -X GET "http://localhost:5000/api/reports/monthly?month=December&year=2024" \
  -H "Authorization: Bearer $TOKEN"
```

## Notes

- Replace `YOUR_TOKEN` with the actual JWT token received from login
- Replace `SHOP_ID` and `CUSTOMER_ID` with actual IDs from created entities
- All authenticated endpoints require the `Authorization: Bearer TOKEN` header
- File uploads use `multipart/form-data` content type
- All other endpoints use `application/json` content type
