# Doctor Hub

Doctor Hub is a full-stack healthcare appointment platform for patients, doctors, assistants, admins, and super admins. The app lets patients discover doctors, book appointments, upload payments, view medical history, exchange messages, and manage prescriptions. Doctors can manage clinics, schedules, appointments, prescriptions, assistants, messages, and their public profile. Admin users can manage platform users, doctors, and reports.


## Site URL

https://doctor-hub-beta.vercel.app/

## Demo Login

Seeded demo users are created by `npm run seed` inside the backend folder.

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@doctorhub.com` | `SuperAdmin@123` |
| Admin | `admin@doctorhub.com` | `Admin@12345` |
| Doctor | `doctor@doctorhub.com` | `Doctor@123` |
| Patient | `patient@doctorhub.com` | `Patient@123` |

Assistant accounts are not seeded by default. Log in as the demo doctor and create an assistant from the doctor assistant management area.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Lucide React
- Backend: Node.js, Express, JWT authentication, Supabase
- Database/storage: Supabase
- File uploads: Multer memory uploads stored in Supabase Storage

## Project Structure

```text
doctor-hub/
  src/                 Frontend React app
  public/              Static frontend assets
  backend/
    src/               Express API source
    uploads/           Uploaded payment/files storage
    data/              Backend data folder
```

## Main Features

- Public doctor search and doctor profile pages
- Patient registration and login
- Role-based dashboards for patient, doctor, assistant, admin, and super admin
- Appointment booking, cancellation, completion, and auto-expiry cleanup
- Doctor clinic and schedule management
- Prescription and medical history management
- Patient payment upload and doctor/assistant payment verification
- In-app messages and notifications
- Admin user, doctor, and report management
- Doctor assistant management with a limit of 3 assistants per doctor



## Prerequisites

- Node.js
- npm
- Supabase project credentials

## Environment Variables

Create or update `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_STORAGE_BUCKET=doctor-hub-uploads
```

The frontend uses this optional variable:

```env
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is not set, the frontend defaults to `http://localhost:5000/api`.

## Install Dependencies

Install frontend dependencies from the project root:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

## Database Setup

Run the SQL schema in Supabase from:

```text
backend/src/config/schema.sql
```

Then seed demo users:

```bash
cd backend
npm run seed
```

## Supabase Storage Setup

Vercel Serverless Functions cannot persist files inside `backend/uploads`. Payment screenshots and medical reports are uploaded to Supabase Storage instead.

Create a public Supabase Storage bucket:

```sql
insert into storage.buckets (id, name, public)
values ('doctor-hub-uploads', 'doctor-hub-uploads', true)
on conflict (id) do update set public = true;
```

If you use a different bucket name, set `SUPABASE_STORAGE_BUCKET` in the backend environment variables.

## Run The App

Start the backend API:

```bash
cd backend
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Start the frontend from the project root:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Useful Scripts

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Backend:

```bash
npm run dev
npm start
npm run seed
```

## Port Notes

If `npm run dev` in `backend` fails with `EADDRINUSE: address already in use :::5000`, another backend process is already running on port `5000`. Stop that process or use the already-running API at `http://localhost:5000`.
