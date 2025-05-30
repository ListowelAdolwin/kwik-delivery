
# Delivery Service API 

A RESTful API built with Express.js and MongoDB for managing delivery services with rider management, order tracking, and eCommerce integration.

## Features

- 🔐 JWT Authentication for riders and admins
- 🔑 API key authentication for eCommerce integration
- 📦 Delivery management and tracking
- 🚴 Rider assignment and status updates
- 💰 Dynamic fee calculation based on distance
- 📊 Admin dashboard functionality
- 📚 Swagger API documentation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, API keys
- **Documentation**: Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd delivery-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` for interactive Swagger documentation.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/delivery-service |
| `JWT_SECRET` | Secret for JWT tokens | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `API_KEY_SECRET` | Secret for API key generation | - |

## API Endpoints

### Public/eCommerce (API Key Required)
- `POST /api/deliveries` - Create delivery
- `GET /api/delivery-fee` - Calculate delivery fee
- `GET /api/deliveries/track/:trackingNumber` - Track delivery
- `DELETE /api/deliveries/:id` - Cancel delivery

### Rider Authentication
- `POST /api/riders/register` - Rider registration
- `POST /api/riders/login` - Rider login
- `GET /api/riders/deliveries` - Get available deliveries
- `POST /api/riders/deliveries/:id/accept` - Accept delivery
- `PUT /api/riders/deliveries/:id/status` - Update delivery status

### Admin Authentication
- `POST /api/admins/register` - Admin registration
- `POST /api/admins/login` - Admin login
- `GET /api/admins/deliveries` - Get all deliveries
- `POST /api/admins/api-keys` - Generate API key

## Delivery Status Flow

1. **PENDING** - Delivery created, waiting for rider
2. **ACCEPTED** - Rider accepted the delivery
3. **PICKED_UP** - Rider picked up the package
4. **IN_TRANSIT** - Package is on the way
5. **DELIVERED** - Package delivered successfully
6. **CANCELLED** - Delivery cancelled

## Fee Calculation

- Base price: ₵5
- Additional ₵1.50 per kilometer beyond first 2km
- Express delivery: +20% surcharge
- Uses Haversine formula for distance calculation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
