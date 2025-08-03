# API Testing Guide

This guide provides step-by-step instructions for testing the AgriConnect API using Postman.

## 🚀 Getting Started

### Prerequisites
- Postman installed
- Server running on `http://localhost:3001`
- Basic understanding of REST APIs

### Base URL
```
http://localhost:3001
```

---

## 🧪 Test Scenarios

### 1. Health Check
**Purpose**: Verify server is running

```http
GET http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. Farmer Management Tests

#### 2.1 Create a New Farmer
```http
POST http://localhost:3001/api/farmers
Content-Type: application/json

{
  "name": "Alice Wanjiku",
  "phone": "+254712345678",
  "location": "Nakuru",
  "cropType": "Potatoes",
  "farmSize": "3 acres"
}
```

#### 2.2 Get All Farmers
```http
GET http://localhost:3001/api/farmers
```

#### 2.3 Send SMS to Farmer
```http
POST http://localhost:3001/api/farmers/1/sms
Content-Type: application/json

{
  "message": "Weather Alert: Heavy rains expected this weekend. Please protect your crops."
}
```

#### 2.4 Send Bulk SMS to All Farmers
```http
POST http://localhost:3001/api/farmers/bulk-sms
Content-Type: application/json

{
  "message": "Market Update: Maize prices have increased to KES 55 per kg. Good time to sell!"
}
```

---

### 3. Buyer Management Tests

#### 3.1 Create a New Buyer
```http
POST http://localhost:3001/api/buyers
Content-Type: application/json

{
  "name": "Green Valley Supermarket",
  "phone": "+254722334455",
  "email": "procurement@greenvalley.com",
  "location": "Eldoret",
  "businessType": "Retail",
  "interestedCrops": ["Potatoes", "Carrots", "Onions"],
  "paymentTerms": "Cash on delivery"
}
```

#### 3.2 Find Buyers Interested in Specific Crop
```http
GET http://localhost:3001/api/buyers/crop/potatoes
```

#### 3.3 Send SMS to Buyer
```http
POST http://localhost:3001/api/buyers/1/sms
Content-Type: application/json

{
  "message": "New harvest available: 500kg of premium potatoes from Nakuru. Contact us for pricing."
}
```

---

### 4. Transaction Management Tests

#### 4.1 Create a New Transaction
```http
POST http://localhost:3001/api/transactions
Content-Type: application/json

{
  "farmerId": 1,
  "buyerId": 1,
  "cropType": "Potatoes",
  "quantity": 200,
  "unit": "kg",
  "pricePerUnit": 45,
  "deliveryDate": "2024-01-25",
  "deliveryLocation": "Eldoret",
  "paymentMethod": "bank_transfer",
  "notes": "Grade A potatoes, well sorted"
}
```

#### 4.2 Update Transaction Status
```http
PATCH http://localhost:3001/api/transactions/1/status
Content-Type: application/json

{
  "status": "confirmed",
  "paymentStatus": "paid"
}
```

#### 4.3 Get Transaction Statistics
```http
GET http://localhost:3001/api/transactions/stats
```

#### 4.4 Filter Transactions
```http
GET http://localhost:3001/api/transactions?status=pending&cropType=potatoes
```

---

### 5. USSD Testing

#### 5.1 Start USSD Session (Main Menu)
```http
POST http://localhost:3001/ussd
Content-Type: application/json

{
  "sessionId": "test_session_001",
  "serviceCode": "*123#",
  "phoneNumber": "+254700123456",
  "text": ""
}
```

**Expected Response:**
```
CON Welcome to AgriConnect
1. Register as Farmer
2. Register as Buyer
3. Check Market Prices
4. Weather Updates
5. My Account
```

#### 5.2 Navigate to Farmer Registration
```http
POST http://localhost:3001/ussd
Content-Type: application/json

{
  "sessionId": "test_session_001",
  "serviceCode": "*123#",
  "phoneNumber": "+254700123456",
  "text": "1"
}
```

#### 5.3 Complete Farmer Registration Flow
```http
POST http://localhost:3001/ussd
Content-Type: application/json

{
  "sessionId": "test_session_001",
  "serviceCode": "*123#",
  "phoneNumber": "+254700123456",
  "text": "1*1*Peter Kamau*Meru*Coffee"
}
```

#### 5.4 Check Market Prices
```http
POST http://localhost:3001/ussd
Content-Type: application/json

{
  "sessionId": "test_session_002",
  "serviceCode": "*123#",
  "phoneNumber": "+254700123457",
  "text": "3"
}
```

#### 5.5 View Active USSD Sessions
```http
GET http://localhost:3001/ussd/sessions
```

---

## 📋 Test Checklist

### ✅ Basic Functionality
- [ ] Server health check passes
- [ ] Can create farmers
- [ ] Can create buyers
- [ ] Can create transactions
- [ ] USSD main menu loads

### ✅ CRUD Operations
- [ ] Create farmer/buyer/transaction
- [ ] Read (get) farmer/buyer/transaction
- [ ] Update farmer/buyer/transaction
- [ ] Delete farmer/buyer/transaction

### ✅ SMS Features
- [ ] Send individual SMS to farmer
- [ ] Send individual SMS to buyer
- [ ] Send bulk SMS to all farmers
- [ ] Send bulk SMS to all buyers

### ✅ Advanced Features
- [ ] Filter transactions by status
- [ ] Filter transactions by crop type
- [ ] Get buyers by crop interest
- [ ] Transaction statistics work
- [ ] USSD registration flow completes

### ✅ Error Handling
- [ ] Invalid farmer ID returns 404
- [ ] Missing required fields return 400
- [ ] Duplicate phone numbers handled
- [ ] Invalid transaction status rejected

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Ensure all controller files exist and server is restarted

### Issue: SMS not sending
**Solution**: Check Africa's Talking credentials in `.env` file

### Issue: USSD session not maintained
**Solution**: Use the same `sessionId` for the entire USSD flow

### Issue: 404 errors
**Solution**: Verify the correct base URL and endpoint paths

### Issue: Validation errors
**Solution**: Check required fields in request body match API documentation

---

## 📊 Sample Test Data

### Farmers
```json
[
  {
    "name": "John Mwangi",
    "phone": "+254701234567",
    "location": "Kiambu",
    "cropType": "Coffee",
    "farmSize": "2 acres"
  },
  {
    "name": "Mary Akinyi",
    "phone": "+254702345678",
    "location": "Kisumu",
    "cropType": "Rice",
    "farmSize": "4 acres"
  }
]
```

### Buyers
```json
[
  {
    "name": "Nairobi Fresh Markets",
    "phone": "+254703456789",
    "email": "orders@nairobifresh.com",
    "location": "Nairobi",
    "businessType": "Wholesale",
    "interestedCrops": ["Coffee", "Tea", "Maize"],
    "paymentTerms": "Net 15"
  }
]
```

### Transactions
```json
[
  {
    "farmerId": 1,
    "buyerId": 1,
    "cropType": "Coffee",
    "quantity": 100,
    "unit": "kg",
    "pricePerUnit": 150,
    "deliveryDate": "2024-02-01",
    "deliveryLocation": "Nairobi",
    "paymentMethod": "mobile_money"
  }
]
```

---

## 🎯 Performance Testing

### Load Testing Endpoints
Test these endpoints with multiple concurrent requests:

1. `GET /api/farmers` (should handle 100+ requests/second)
2. `POST /api/transactions` (should handle 50+ requests/second)
3. `POST /ussd` (should handle 200+ requests/second)

### Response Time Expectations
- Simple GET requests: < 100ms
- POST requests with validation: < 200ms
- USSD requests: < 150ms
- SMS sending: < 500ms

---

This testing guide ensures your AgriConnect API is working correctly and ready for production use.