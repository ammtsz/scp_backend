# Healthcare Management System – Backend

**Healthcare Management System** is a volunteer project supporting a local community in Brazil to manage attendances and treatments in a spiritual center. The goal is to improve organization and care for all participants.

This backend (NestJS, TypeScript, PostgreSQL) provides the server-side foundation and API for the system. The [frontend project](https://github.com/ammtsz/scp_frontend) is developed in parallel, delivering the user interface and client-side logic.

---

## 🚀 Project Story & AI Agent Experience

The project began with a comprehensive requirements document, written from a project manager’s perspective, detailing business rules, page responsibilities, and data needs. This document was provided to GitHub Copilot, which analyzed the requirements and generated an initial implementation plan using NestJS, TypeScript, and PostgreSQL. This ensured the architecture and features were closely aligned with real-world needs and professional standards.

This project is also a real-world experiment in leveraging AI coding agents (GitHub Copilot) to accelerate development and test the boundaries of prompt-driven engineering.

Development is a collaborative process between myself and GitHub Copilot: I bring experience with NestJS and TypeORM, while the agent helps rapidly scaffold endpoints, services, and relationships. I started by sharing my ideas for database tables and relationships, and now Copilot analyzes the [frontend project](https://github.com/ammtsz/scp_frontend) to generate backend code that fits those needs. For database connectivity, I use Docker and TypeORM, and Copilot assists with adding decorators and Swagger for API documentation.

Most backend development flows smoothly, though migrations remain a recurring challenge. Having both backend and [frontend](https://github.com/ammtsz/scp_frontend) in the same VS Code workspace makes it easy to update features quickly, since backend changes can be made in direct response to frontend needs.

Copilot has been instrumental in accelerating backend development. The experience highlights how valuable AI agents are for scaffolding and productivity, especially in projects that are verbose and require a lot of routine coding. However, as I learned from the frontend, things can get out of control easily without the right approach to using the agent, so ongoing review and refactoring has been essential.

---

## � Technologies Used

- **Backend**: NestJS, TypeScript, PostgreSQL, TypeORM, Docker
- **Testing**: Jest

---

## ✨ Key Features

- **Patient Management**: Create, update, and track patient records
- **Attendance Scheduling**: Manage appointments and attendance workflows
- **Treatment Records**: Track treatments and session history
- **Schedule Settings**: Configure and manage scheduling rules
- **Data Validation & Security**: Robust validation and secure endpoints
- **TypeORM Integration**: Database ORM for models and migrations

---

## 📁 Project Structure

```bash
src/
├── app.controller.ts         # Main app controller
├── app.module.ts             # Main app module
├── app.service.ts            # Main app service
├── main.ts                   # Entry point
├── data-source.ts            # TypeORM data source config
├── controllers/              # Route controllers
├── services/                 # Business logic services
├── entities/                 # TypeORM entities
├── dtos/                     # Data Transfer Objects
├── transformers/             # Data transformers
├── decorators/               # Custom decorators
├── modules/                  # Feature modules
├── common/                   # Shared utilities and types
├── config/                   # Configuration files
├── utils/                    # Utility functions
└── __tests__/                # Test files
```

---

## � How to Run the Project

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment file**

   ```bash
   cp .env.example .env
   # Edit the .env file with your database credentials
   ```

3. **Start the database**

   ```bash
   docker-compose up -d
   ```

   The database will be automatically initialized with the complete schema from `init.sql`.

4. **Start the development server**

   ```bash
   npm run start:dev
   ```

5. **Production mode**

   ```bash
   npm run build
   npm run start:prod
   ```

---

## 📊 Database Schema

The complete database schema is defined in `init.sql` and includes:

- Patient management tables
- Attendance scheduling system
- Treatment records with comprehensive tracking
- Proper relationships and constraints
- Optimized indexes for performance

---

## 🔄 Data Flow

1. Client Request → Controller
2. Controller validates input using DTOs
3. Service processes business logic
4. Repository handles data operations
5. Transformer formats response
6. Controller returns response

---

## 📈 Current Status & Next Steps

- **Mostly functional**: Core features work, but some features need fixing
- **Ongoing development**: Refactoring, bug fixes, and new features in progress
- **Improved workflow**: Now balancing agent-driven coding with manual oversight for better code quality
