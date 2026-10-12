# StudyVault 📚🏛️

> A centralized academic platform for college students to browse study materials, track lecture schedules, integrate with Google Calendar, and monitor attendance with smart `< 75%` warning calculations.

---

## 🎨 Design Theme & Aesthetic
StudyVault is crafted with a calm, warm, and approachable aesthetic inspired by a sunlit, tidy room:
- **Palette**: Warm cream (`#E4E4D4`), muted sage green (`#C0D5C3`), olive-sage (`#A9B28C`), deep slate charcoal (`#2F3E4A`), with caramel (`#C48E5A`) and mustard (`#D4A93C`) highlights.
- **Typography**: Chunky rounded Fredoka headings paired with crisp DM Sans body text and two-tone emphasis.
- **Shapes**: Flat vector color-blocks, pill-shaped buttons, subtle lift transitions, and accessible contrast ratios.

---

## 🛠️ Tech Stack (MERN, Strictly No SQL)
- **Database**: MongoDB with Mongoose ODM (supports MongoDB Atlas, local instance, and zero-config in-memory dev fallback)
- **Backend**: Node.js + Express REST API
  - JWT authentication & role-based route guards (`student` | `admin`)
  - API hardening: `helmet`, `cors`, and `express-rate-limit`
  - Notes file storage: `multer` with MIME/extension validation and filename sanitization (20 MB limit)
  - Google Calendar API: `googleapis` integration with per-user token storage and non-blocking background sync
- **Frontend**: React (Vite) + Tailwind CSS + React Router + Lucide Icons

---

## 📁 Project Structure
```text
/home/velu/wp/
├── package.json             # Root scripts
├── server/
│   ├── src/
│   │   ├── config/          # MongoDB connection (Atlas / local / memory fallback)
│   │   ├── models/          # User, Subject, Module, Note, Lecture, Attendance
│   │   ├── middleware/      # JWT auth, role guard, Multer upload, rate limiter, error handler
│   │   ├── controllers/     # Auth, subjects, notes, lectures, attendance
│   │   ├── routes/          # REST endpoints
│   │   ├── utils/           # Google Calendar sync, seed script, API test suite
│   │   ├── app.js           # Express app setup with middleware
│   │   └── server.js        # Server listener and dev auto-seeder
│   ├── uploads/             # Local notes storage
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── api/             # API client with token interceptors
    │   ├── context/         # AuthContext with dev demo role switcher
    │   ├── components/      # Navbar, AttendanceCard, NoteCard, LectureCard, ProtectedRoute
    │   ├── pages/
    │   │   ├── Auth/        # Login & Register
    │   │   ├── Student/     # Dashboard, Notes Library, Lectures, Attendance Tracker
    │   │   └── Admin/       # Admin Portal (Step 4)
    │   ├── App.jsx
    │   └── index.css
    ├── .env.example
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Installation
Install dependencies in both client and server:
```bash
npm run install:all
# or:
cd server && npm install
cd ../client && npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` in both folders:

**Server (`server/.env`)**:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional: Leave blank to use zero-config in-memory MongoDB
MONGODB_URI=

JWT_SECRET=studyvault_super_secret_jwt_key_2026

# Optional: Google Calendar Integration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

**Client (`client/.env`)**:
```env
VITE_API_URL=
```

### 3. Database Seeding
To populate sample subjects, modules, notes, lectures, and attendance across 2 semesters:
```bash
npm run seed
# or:
cd server && npm run seed
```
*(In development, the server also auto-seeds automatically on first boot if no users exist.)*

**Pre-seeded Credentials**:
- **Student**: `student@studyvault.edu` / `password123`
- **Admin**: `admin@studyvault.edu` / `password123`

### 4. Running the App
In separate terminals (or concurrently):
```bash
# Terminal 1: Backend API
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📋 Steps 1 to 3 Implemented Features
1. **Database & Connection**: Mongoose models with compound indexes, dev fallback with `mongodb-memory-server` and non-persistence warning.
2. **Security & API Hardening**: `helmet`, `cors`, `express-rate-limit` on auth routes, JWT role guards (`student`/`admin`).
3. **File Upload Security**: Multer file type filtering (PDF, DOC/DOCX, PPT/PPTX, Images), 20MB ceiling, filename sanitization.
4. **Student Experience**:
   - **Student Dashboard**: Welcome banner, overall attendance gauge, below-75% alerts, upcoming lectures, and recent notes.
   - **Study Material Vault**: Multi-parameter filtering by semester, subject, exam type (Midterm/Endsem), and module (1 to N).
   - **Lecture Timetable**: Schedule view with Google Calendar sync triggers and attached note downloads.
   - **Attendance Tracker**: MongoDB aggregation pipeline calculations, prominent below-75% alerts with attendance targets, and interactive student self-logging per lecture.
