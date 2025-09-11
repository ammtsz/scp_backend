# MVP Center Backend

## Description

The MVP Center Backend is a robust NestJS applica## API Endpoints

| Method | Endpoint                                               | Description                   |
| ------ | ------------------------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/patients`                                            | Get all patients              |
| POST   | `/patients`                                            | Create new patient            |
| GET    | `/patients/:id`                                        | Get patient by ID             |
| PUT    | `/patients/:id`                                        | Update patient                |
| DELETE | `/patients/:id`                                        | Delete patient                |
| GET    | `/attendances`                                         | Get all attendances           |
| POST   | `/attendances`                                         | Create new attendance         |
| GET    | `/attendances/:id`                                     | Get attendance by ID          |
| PUT    | `/attendances/:id`                                     | Update attendance             |
| DELETE | `/attendances/:id`                                     | Delete attendance             |
| GET    | `/attendances/date/:date`                              | Get attendances by date       |
| PUT    | `/attendances/:id/status`                              | Update attendance status      |
| GET    | `/schedule-settings`                                   | Get schedule settings         |
| POST   | `/schedule-settings`                                   | Create schedule setting       |
| PUT    | `/schedule-settings/:id`                               | Update schedule setting       |
| DELETE | `/schedule-settings/:id`                               | Delete schedule setting       |
| GET    | `/schedule-settings/:dayOfWeek`                        | Get settings by day           |
| GET    | `/treatment-records`                                   | Get all treatment records     |
| POST   | `/treatment-records`                                   | Create new treatment record   |
| GET    | `/treatment-records/:id`                               | Get treatment record by ID    |
| PUT    | `/treatment-records/:id`                               | Update treatment record       |
| DELETE | `/treatment-records/:id`                               | Delete treatment record       |
| GET    | `/treatment-records/patient/:patientId`                | Get records by patient        |
| GET    | `/treatment-sessions`                                  | Get all treatment sessions    |
| POST   | `/treatment-sessions`                                  | Create new treatment session  |
| GET    | `/treatment-sessions/:id`                              | Get treatment session by ID   |
| PUT    | `/treatment-sessions/:id`                              | Update treatment session      |
| DELETE | `/treatment-sessions/:id`                              | Delete treatment session      |
| GET    | `/treatment-sessions/patient/:patientId`               | Get sessions by patient       |
| PUT    | `/treatment-sessions/:id/complete`                     | Complete treatment session    |
| PUT    | `/treatment-sessions/:id/activate`                     | Activate treatment session    |
| PUT    | `/treatment-sessions/:id/suspend`                      | Suspend treatment session     |
| GET    | `/treatment-session-records`                           | Get all session records       |
| POST   | `/treatment-session-records`                           | Create new session record     |
| GET    | `/treatment-session-records/:id`                       | Get session record by ID      |
| PUT    | `/treatment-session-records/:id`                       | Update session record         |
| DELETE | `/treatment-session-records/:id`                       | Delete session record         |
| GET    | `/treatment-session-records/session/:sessionId`        | Get records by session        |
| GET    | `/treatment-session-records/patient/:patientId`        | Get records by patient        |
| PUT    | `/treatment-session-records/:id/complete`              | Complete session record       |
| PUT    | `/treatment-session-records/:id/mark-missed`           | Mark session as missed        |
| PUT    | `/treatment-session-records/:id/reschedule`            | Reschedule session record     |
| GET    | `/treatment-session-records/analytics/completion-rate` | Get completion rate analytics |
| GET    | `/treatment-session-records/analytics/missed-sessions` | Get missed sessions analytics | to serve as the backend for a spiritual center management system. It provides a comprehensive API for managing patient records, scheduling appointments, and tracking treatments. |

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
