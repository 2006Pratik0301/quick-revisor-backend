# Quick Revisor Backend

Backend API for the Quick Revisor web application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your PostgreSQL database URL and JWT secret.

4. Create the database tables:
```bash
npm run migrate
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token (protected)

### Subjects
- `GET /api/subjects` - Get all subjects (protected)
- `GET /api/subjects/:id` - Get subject by ID (protected)
- `POST /api/subjects` - Create new subject (protected)
- `PUT /api/subjects/:id` - Update subject (protected)
- `DELETE /api/subjects/:id` - Delete subject (protected)

### Questions
- `GET /api/questions/subject/:subjectId` - Get all questions for a subject (protected)
- `GET /api/questions/:id` - Get question by ID (protected)
- `POST /api/questions/subject/:subjectId` - Create new question (protected)
- `PUT /api/questions/:id` - Update question (protected)
- `DELETE /api/questions/:id` - Delete question (protected)

