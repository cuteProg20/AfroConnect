# AgriConnect Backend API

A comprehensive backend solution for connecting farmers and buyers in agricultural markets, featuring SMS notifications, USSD integration, and transaction management.

## 🚀 Features

- **Farmer Management**: Complete CRUD operations for farmer profiles
- **Buyer Management**: Manage buyer profiles and preferences
- **Transaction System**: Handle sales transactions between farmers and buyers
- **SMS Integration**: Africa's Talking SMS notifications and alerts
- **USSD Support**: Interactive mobile menu system for feature phones
- **Market Analytics**: Transaction statistics and reporting

## 📋 Prerequisites

- Node.js (v14 or higher)
- Africa's Talking account for SMS/USSD services
- Postman (for API testing)

## 🛠️ Installation

1. **Clone or setup the project**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Update the `.env` file with your Africa's Talking credentials:
   ```env
   AFRICASTALKING_API_KEY=your_api_key_here
   AFRICASTALKING_USERNAME=your_username_here
   PORT=3001
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

   The server will run on `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Health Check
```http
GET /api/health
```
Returns server status and timestamp.

---

## 👨‍🌾 Farmers API

### Get All Farmers
```http
GET /api/farmers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "+254700000000",
      "location": "Nairobi",
      "cropType": "Maize",
      "farmSize": "5 acres",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Create New Farmer
```http
POST /api/farmers
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+254700000000",
  "location": "Nairobi",
  "cropType": "Maize",
  "farmSize": "5 acres"
}
```

### Get Farmer by ID
```http
GET /api/farmers/:id
```

### Update Farmer
```http
PUT /api/farmers/:id
```

### Delete Farmer
```http
DELETE /api/farmers/:id
```

### Send SMS to Farmer
```http
POST /api/farmers/:id/sms
```

**Request Body:**
```json
{
  "message": "Weather alert: Heavy rains expected tomorrow."
}
```

### Send Bulk SMS to All Farmers
```http
POST /api/farmers/bulk-sms
```

**Request Body:**
```json
{
  "message": "Market prices updated. Maize: KES 50/kg"
}
```

---

## 🏢 Buyers API

### Get All Buyers
```http
GET /api/buyers
```

### Create New Buyer
```http
POST /api/buyers
```

**Request Body:**
```json
{
  "name": "ABC Agro Ltd",
  "phone": "+254700000010",
  "email": "contact@abcagro.com",
  "location": "Nairobi",
  "businessType": "Wholesale",
  "interestedCrops": ["Maize", "Rice", "Beans"],
  "paymentTerms": "Net 30"
}
```

### Get Buyers by Crop Interest
```http
GET /api/buyers/crop/:crop
```

**Example:**
```http
GET /api/buyers/crop/maize
```

### Other Buyer Endpoints
- `GET /api/buyers/:id` - Get buyer by ID
- `PUT /api/buyers/:id` - Update buyer
- `DELETE /api/buyers/:id` - Delete buyer
- `POST /api/buyers/:id/sms` - Send SMS to buyer
- `POST /api/buyers/bulk-sms` - Send bulk SMS to buyers

---

## 💰 Transactions API

### Get All Transactions
```http
GET /api/transactions
```

**Query Parameters:**
- `status` - Filter by status (pending, completed, cancelled)
- `farmerId` - Filter by farmer ID
- `buyerId` - Filter by buyer ID
- `cropType` - Filter by crop type

**Example:**
```http
GET /api/transactions?status=pending&cropType=maize
```

### Create New Transaction
```http
POST /api/transactions
```

**Request Body:**
```json
{
  "farmerId": 1,
  "buyerId": 1,
  "cropType": "Maize",
  "quantity": 100,
  "unit": "kg",
  "pricePerUnit": 50,
  "deliveryDate": "2024-01-20",
  "deliveryLocation": "Nairobi",
  "paymentMethod": "bank_transfer",
  "notes": "High quality maize"
}
```

### Update Transaction Status
```http
PATCH /api/transactions/:id/status
```

**Request Body:**
```json
{
  "status": "completed",
  "paymentStatus": "paid"
}
```

**Valid Statuses:**
- **Transaction Status**: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`
- **Payment Status**: `pending`, `paid`, `failed`, `refunded`

### Get Transaction Statistics
```http
GET /api/transactions/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTransactions": 10,
      "completedTransactions": 7,
      "pendingTransactions": 3,
      "totalValue": 50000,
      "completedValue": 35000,
      "averageTransactionValue": 5000
    },
    "cropStats": {
      "Maize": {
        "count": 5,
        "totalValue": 25000,
        "totalQuantity": 500
      }
    }
  }
}
```

### Other Transaction Endpoints
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/farmer/:farmerId` - Get farmer's transactions
- `GET /api/transactions/buyer/:buyerId` - Get buyer's transactions

---

## 📱 USSD API

### USSD Webhook
```http
POST /ussd
```

**Request Body (from Africa's Talking):**
```json
{
  "sessionId": "ATUid_session_id",
  "serviceCode": "*123#",
  "phoneNumber": "+254700000000",
  "text": "1*1*John Doe"
}
```

### USSD Menu Structure
```
Welcome to AgriConnect
1. Register as Farmer
2. Register as Buyer
3. Check Market Prices
4. Weather Updates
5. My Account
```

### Debug Endpoints
- `GET /ussd/sessions` - View active USSD sessions
- `DELETE /ussd/sessions` - Clear all USSD sessions

---

## 📧 SMS Service Features

The SMS service automatically sends:

1. **Welcome Messages**: When farmers/buyers register
2. **Transaction Notifications**: When transactions are created/updated
3. **Status Updates**: When transaction status changes
4. **Custom Messages**: Via API endpoints

### SMS Message Types

- `sendWelcomeSMS(phone, name)` - Welcome message for farmers
- `sendBuyerWelcomeSMS(phone, name)` - Welcome message for buyers
- `sendWeatherAlert(phones, weatherInfo)` - Weather alerts
- `sendMarketPriceUpdate(phones, priceInfo)` - Market price updates
- `sendCropAvailabilityAlert(phones, cropInfo)` - Crop availability alerts

---

## 🧪 Testing with Postman

### 1. Test USSD Flow
```json
POST /ussd
{
  "sessionId": "test123",
  "serviceCode": "*123#",
  "phoneNumber": "+254700000000",
  "text": ""
}
```

### 2. Register a Farmer via API
```json
POST /api/farmers
{
  "name": "Test Farmer",
  "phone": "+254700000001",
  "location": "Kisumu",
  "cropType": "Rice"
}
```

### 3. Create a Transaction
```json
POST /api/transactions
{
  "farmerId": 1,
  "buyerId": 1,
  "cropType": "Maize",
  "quantity": 50,
  "pricePerUnit": 60
}
```

---

## 🏗️ Project Structure

```
├── controllers/
│   ├── farmersController.js      # Farmer business logic
│   ├── buyersController.js       # Buyer business logic
│   ├── transactionsController.js # Transaction management
│   └── ussdController.js         # USSD menu system
├── routes/
│   ├── farmersRoutes.js          # Farmer API routes
│   ├── buyersRoutes.js           # Buyer API routes
│   ├── transactionsRoutes.js     # Transaction API routes
│   └── ussdRoutes.js             # USSD routes
├── services/
│   └── smsService.js             # Africa's Talking SMS integration
├── .env                          # Environment variables
├── server.js                     # Main application server
└── README.md                     # This documentation
```

---

## 🔧 Configuration

### Environment Variables
```env
# Africa's Talking Configuration
AFRICASTALKING_API_KEY=your_api_key_here
AFRICASTALKING_USERNAME=your_username_here

# Server Configuration
PORT=3001
```

### Africa's Talking Setup
1. Create account at [africastalking.com](https://africastalking.com)
2. Get API key from dashboard
3. Configure USSD service code (e.g., `*123#`)
4. Set webhook URL to `http://your-domain.com/ussd`

---

## 🚀 Deployment

### Local Development
```bash
node server.js
```

### Production Considerations
- Use process manager (PM2)
- Set up proper database (MongoDB/PostgreSQL)
- Configure reverse proxy (Nginx)
- Enable HTTPS
- Set up monitoring and logging

---

## 📊 Sample Data

The system comes with sample data:

**Farmers:**
- John Doe (Maize farmer, Nairobi)
- Jane Smith (Rice farmer, Kisumu)

**Buyers:**
- ABC Agro Ltd (Wholesale, Nairobi)
- Fresh Market Co (Retail, Mombasa)

**Transactions:**
- Completed maize sale (100kg, KES 5,000)
- Pending rice order (50kg, KES 4,000)

---

## 🤝 Support

For issues and questions:
1. Check the API responses for error messages
2. Verify Africa's Talking credentials
3. Ensure proper request format
4. Check server logs for debugging

---

## 📝 License

This project is for educational and development purposes.

/*
  # AgriConnect Database Schema

  1. New Tables
    - `farmers`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `phone` (text, unique, required)
      - `location` (text, required)
      - `crop_type` (text)
      - `farm_size` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `buyers`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `phone` (text, unique, required)
      - `email` (text, unique)
      - `location` (text, required)
      - `business_type` (text)
      - `interested_crops` (text array)
      - `payment_terms` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `farmer_id` (uuid, foreign key)
      - `buyer_id` (uuid, foreign key)
      - `crop_type` (text, required)
      - `quantity` (decimal, required)
      - `unit` (text, default 'kg')
      - `price_per_unit` (decimal, required)
      - `total_amount` (decimal, required)
      - `currency` (text, default 'TSh')
      - `status` (text, default 'pending')
      - `payment_status` (text, default 'pending')
      - `payment_method` (text)
      - `delivery_date` (date)
      - `delivery_location` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `market_prices`
      - `id` (uuid, primary key)
      - `crop_type` (text, required)
      - `price` (decimal, required)
      - `currency` (text, default 'TSh')
      - `market_location` (text)
      - `quality_grade` (text)
      - `price_change` (decimal)
      - `updated_at` (timestamp)
    
    - `ussd_sessions`
      - `id` (uuid, primary key)
      - `session_id` (text, unique, required)
      - `phone_number` (text, required)
      - `current_menu` (text, default 'MAIN')
      - `user_data` (jsonb)
      - `step` (integer, default 0)
      - `user_type` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for service role operations

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for filtering
*/


/*
  # Seed Sample Data for AgriConnect

  1. Sample Data
    - Insert sample farmers from Tanzania
    - Insert sample buyers (businesses)
    - Insert current market prices
    - Insert sample transactions

  2. Data Features
    - Realistic Tanzanian names and locations
    - Current market prices in TSh
    - Various crop types common in Tanzania
    - Different business types and payment terms
*/