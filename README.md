# MVP Center Backend

## Description

The MVP Center Backend is a robust NestJS application designed to serve as the backend for a spiritual center management system. It provides a comprehensive API for managing patient records, scheduling appointments, and tracking treatments.

## Features

- 🏥 Patient Management
- 📅 Attendance Scheduling
- ✅ Treatment Records
- 📊 Schedule Settings
- 🔒 Data Validation & Security
- 🔄 TypeORM Integration

## 🚀 Technologies

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker
- Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Docker and Docker Compose
- npm or yarn

## 🔧 Installation

1. Clone the repository

```bash
git clone <repository-url>
cd mvp-center-backend
```

2. Install dependencies

```bash
npm install
```

3. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your database credentials
```

4. Start the Database

```bash
docker-compose up -d
```

The database will be automatically initialized with the complete schema from `init.sql`.

## 🏃‍♂️ Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

### Endpoints

#### Attendances

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | `/attendances`     | Create new attendance |
| GET    | `/attendances`     | List all attendances  |
| GET    | `/attendances/:id` | Get attendance by ID  |
| PATCH  | `/attendances/:id` | Update attendance     |
| DELETE | `/attendances/:id` | Delete attendance     |

##### Request/Response Examples

###### Create Attendance

```json
// POST /attendances
// Request
{
  "patient_id": 1,
  "type": "FIRST_TIME",
  "scheduled_date": "2025-07-22",
  "scheduled_time": "14:30",
  "notes": "First consultation"
}

// Response (201 Created)
{
  "id": 1,
  "patient_id": 1,
  "type": "FIRST_TIME",
  "status": "SCHEDULED",
  "scheduled_date": "2025-07-22",
  "scheduled_time": "14:30",
  "notes": "First consultation",
  "created_at": "2025-07-22T14:30:00.000Z",
  "updated_at": "2025-07-22T14:30:00.000Z"
}
```

## 📁 Project Structure

```
src/
├── controllers/        # Route controllers (attendance.controller.ts, etc.)
├── services/          # Business logic (attendance.service.ts, etc.)
├── entities/          # TypeORM entities (attendance.entity.ts, etc.)
├── dtos/             # Data Transfer Objects (attendance.dto.ts, etc.)
├── transformers/     # Data transformers (attendance.transformer.ts, etc.)
├── repositories/     # Custom repositories
└── config/          # Configuration files
```

## 📊 Database Schema

The complete database schema is defined in `init.sql` and includes:

- Patient management tables
- Attendance scheduling system
- Treatment records with comprehensive tracking
- Proper relationships and constraints
- Optimized indexes for performance

## 🔄 Data Flow

1. Client Request → Controller
2. Controller validates input using DTOs
3. Service processes business logic
4. Repository handles data operations
5. Transformer formats response
6. Controller returns response

## 🔐 Environment Variables

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=mvp_center
PORT=3000
NODE_ENV=development
```

## 📝 Additional Notes

- All dates are handled in ISO format (YYYY-MM-DD)
- Times are stored in 24-hour format (HH:mm)
- IDs are numeric and auto-incrementing
- Responses are transformed using dedicated transformer classes

## License

[MIT licensed](LICENSE)
