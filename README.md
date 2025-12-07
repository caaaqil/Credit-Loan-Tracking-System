# Credit/Loan Tracking System

A full-stack application for managing credit and loan transactions between shops and customers.

## Features

- **Shop Management**: Register and track shops with auto-generated codes
- **Customer Management**: Register and track customers with auto-generated codes
- **Loan Tracking**: Record loans from shops and to customers with automatic balance updates
- **Payment Tracking**: Record payments with automatic balance adjustments
- **File Uploads**: Upload multiple files (images/PDFs) to AWS S3 for each transaction
- **Audit Logging**: Complete audit trail of all transactions
- **Monthly Reports**: Generate and export monthly summaries
- **Soft Delete**: All data is preserved with soft delete functionality
- **JWT Authentication**: Secure authentication system

## Technology Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose (with transactions)
- JWT Authentication
- AWS S3 for file storage
- bcryptjs for password hashing
- Multer for file uploads
- express-validator for validation

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher with replica set support for transactions)
- AWS Account with S3 bucket configured
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd "credit loan tracking system"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGO_URI=mongodb://localhost:27017/credit-loan-tracking
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket-name
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running. For local development with transactions support, you need a replica set:

```bash
# If using MongoDB locally, start it as a replica set
mongod --replSet rs0
# In another terminal, initialize the replica set
mongosh
> rs.initiate()
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on http://localhost:5000

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Shops
- `GET /api/shops` - Get all shops (with pagination, search, filter)
- `GET /api/shops/:id` - Get single shop
- `POST /api/shops` - Create new shop
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Soft delete shop

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Soft delete customer

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create new loan (with transaction)
- `PUT /api/loans/:id` - Update loan (recalculates balances)
- `DELETE /api/loans/:id` - Soft delete loan (reverses balance)

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment (with transaction)
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Soft delete payment

### Uploads
- `POST /api/uploads` - Upload files to S3

### Reports
- `GET /api/reports/monthly?month=January&year=2024` - Get monthly report

## Testing the API

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the returned token for authenticated requests.

### Create a Shop

```bash
curl -X POST http://localhost:5000/api/shops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "ABC Electronics",
    "ownerName": "Ahmed Ali",
    "phone": "1234567890",
    "village": "Downtown",
    "category": "Retail"
  }'
```

### Create a Customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Mohamed Hassan",
    "phone": "0987654321",
    "village": "Suburb Area",
    "category": "Regular"
  }'
```

### Create a Loan

```bash
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "direction": "FROM_SHOP",
    "partyId": "SHOP_ID_HERE",
    "partyModel": "Shop",
    "orderLetter": "ORD-001",
    "amount": 5000,
    "month": "December",
    "year": 2024
  }'
```

## Project Structure

```
credit-loan-tracking-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── shopController.js
│   │   ├── customerController.js
│   │   ├── loanController.js
│   │   ├── paymentController.js
│   │   ├── uploadController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Shop.js
│   │   ├── Customer.js
│   │   ├── Loan.js
│   │   ├── Payment.js
│   │   └── Audit.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── shops.js
│   │   ├── customers.js
│   │   ├── loans.js
│   │   ├── payments.js
│   │   ├── uploads.js
│   │   └── reports.js
│   ├── utils/
│   │   └── idGenerator.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── LoanFormModal.jsx
│   │   │   └── PaymentFormModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Shops.jsx
│   │   │   ├── ShopDetail.jsx
│   │   │   ├── AddShop.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── CustomerDetail.jsx
│   │   │   ├── AddCustomer.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Key Features Explained

### Auto-Generated Codes
- Shops: SHOP-001, SHOP-002, etc.
- Customers: CUST-001, CUST-002, etc.

### MongoDB Transactions
All loan and payment operations use MongoDB transactions to ensure atomic balance updates. If any part of the operation fails, the entire transaction is rolled back.

### Soft Delete
All entities use a soft delete approach with an `isDeleted` flag. Data is never permanently removed from the database.

### Audit Logging
Every create, update, and delete operation is logged in the Audit collection with before/after states.

### File Organization in S3
Files are organized in S3 with the following structure:
```
{userId}/{partyModel}/{partyId}/{loan|payment}/{timestamp}/{filename}
```

## Default User Credentials

After running the application for the first time, register a new user through the UI or API.

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas with replica set
4. Set up proper AWS IAM roles for S3 access
5. Build frontend: `cd frontend && npm run build`
6. Serve frontend build files with a web server (nginx, Apache, etc.)
7. Use a process manager like PM2 for the backend

## Troubleshooting

### MongoDB Transaction Errors
Make sure MongoDB is running as a replica set. Transactions require replica set support.

### AWS S3 Upload Errors
Verify your AWS credentials and ensure the S3 bucket exists and has proper permissions.

### CORS Errors
The backend is configured to accept requests from all origins in development. Update CORS settings for production.

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
# Credit-Loan-Tracking-System
