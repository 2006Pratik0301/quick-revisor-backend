# Quick Revisor Backend

Backend API for the Quick Revisor web application.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with the following variables:

```bash
# For Neon or other Postgres providers (recommended)
# Use the full connection string provided by your provider
# Example:
# DATABASE_URL=postgres://<user>:<password>@<host>:5432/<db>?sslmode=require
# or
# NEON_DATABASE_URL=postgres://<user>:<password>@<host>:5432/<db>?sslmode=require

# Supabase (alternative):
SUPABASE_DB_HOST=your-db-host
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-password
SUPABASE_DB_NAME=postgres
SUPABASE_DB_PORT=6543
# Use port 6543 for connection pooler (recommended) or 5432 for direct connection

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=5000
```

3. **Configure Database Connection** (Neon or Supabase):

   **Method 1: Connection Pooler (Recommended - No IP whitelist needed)**

   This is the recommended approach as it doesn't require IP whitelisting:

   1. Go to your Supabase Dashboard
   2. Navigate to **Settings > Database > Connection Pooling**
   3. Copy the **Transaction** mode connection string
   4. Extract the hostname and port from the connection string
   5. Update your `.env` file:
      ```
      SUPABASE_DB_HOST=aws-0-[region].pooler.supabase.com
      SUPABASE_DB_PORT=6543
      ```

   **Method 2: Direct Connection (Requires IP whitelist)**

   1. Go to your Supabase Dashboard
   2. Navigate to **Settings > Database**
   3. Find your connection details (host, port, database, user, password)
   4. Add your IP address to the allowlist in **Settings > Database > Allowed IPs**
   5. Update your `.env` file:
      ```
      SUPABASE_DB_HOST=db.[project-ref].supabase.co
      SUPABASE_DB_PORT=5432
      ```

   **Troubleshooting Connection Issues:**

   - If you see connection timeout errors, use the connection pooler (Method 1)
   - Ensure your Supabase project is not paused (free tier projects pause after inactivity)
   - Check that your firewall isn't blocking ports 5432 or 6543
   - Verify all environment variables are set correctly

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

---

## Deploying to Vercel :rocket:

This project is compatible with Vercel's Node serverless platform. The repository includes a `vercel.json` configuration that routes all requests to `src/server.js` and uses the `@vercel/node` builder.

Quick steps:

1. Create a new project on Vercel and connect your GitHub repository (or use the Vercel CLI).
2. In the Vercel project settings, add the following environment variables:
   - `DATABASE_URL` (or `NEON_DATABASE_URL`) — your Neon/Postgres connection string
   - `JWT_SECRET` — your JWT secret
   - `NODE_ENV=production`
3. Deploy the project (Vercel will build using `@vercel/node`).

Notes:

- Migrations: Vercel deployments do not automatically run database migrations. Run `npm run migrate` locally (or via CI) against your Neon database before accepting traffic. You can run migrations from a CI workflow or a dedicated job runner.
- Keep secrets out of the repository — set them in Vercel's Environment Variables.
- If you need to run migrations as part of deployment, consider adding a GitHub Action or a one-off job to run `npm run migrate` against your database after deployment.

If you want, I can add a simple GitHub Action that runs migrations after merges to `main` (optional).
