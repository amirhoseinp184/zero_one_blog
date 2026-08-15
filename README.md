# 📝 Modern Full-Stack Blog Platform

A feature-rich, full-stack blogging application featuring smart multi-step authentication, interactive avatar cropping, dynamic rich text editing, and infinite-scrolling feeds.

---

## ✨ Features

### 🔐 Smart Multi-Step Authentication
* **Flexible Registration:** Multi-step onboarding flow supporting email or phone registration with OTP verification *(Email OTP active; SMS OTP pending)*.
* **Context-Aware Login:**
  1. Users enter their identifier (username, email, or phone number).
  2. The system dynamically presents available authentication options based on the user's profile (Password, Email OTP, or Phone OTP).
* **Smart UI Adapters:** Automatically hides unlinked contact channels (e.g., hides Email OTP if no email is associated with the account).

### 🎨 User Dashboard & Interactive Profiles
* **Profile Management:** Update bio/about-me, handle display names, and upload avatars.
* **Custom Avatar Cropper:** Interactive circular cropping tool with min/max boundary constraints, allowing users to select and trim image sections before uploading.
* **Post Management:** View, create, edit, and delete draft or published posts.
* **Public Profiles:** Shareable user pages displaying public posts, bio, avatar, and follower/following counts with a "Follow" action button.

### 📰 Content Creation & Feed
* **Infinite Scroll Feed:** Main page uses dynamic infinite fetching (`TanStack Query`) for seamless reading.
* **Rich Text Editor:** Custom text editing supporting bold, italic, headings, and standard paragraphs.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React
* **UI Library:** Material UI (MUI)
* **State & Data Fetching:** TanStack Query (`useInfiniteQuery`, `useMutation`)
* **Forms & Validation:** React Hook Form + Zod
* **Icons & Styling:** MUI Icons / Emotion

### **Backend** *(Adjust based on your stack)*
* **Runtime / Framework:** Python/Django
* **Database:** SQLite3
* **Authentication:** JWT / Sessions & OTP Verification Services

---

## 📁 Repository Structure

```text
.
├── backend/            # API routes, views, database models, and OTP logic
│   ├── .env.example
|   |── manage.py
└── frontend/           # React SPA, MUI components, forms, and custom hooks
    ├── src/
    └── package.json
```

## 🚀 Getting Started

Follow these steps to set up and run both the backend and frontend services on your local development machine.

### 📋 Prerequisites

Ensure you have the following installed on your system:
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (comes bundled with Node.js)
* **python3**

---

### ⚙️ 1. Backend Setup

1. **Navigate into the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```


3. **Install dependencies:**
   ```bash
   pip install -r ./requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the root of the `backend` directory:
   ```env
   SECRET_KEY=django-insecure-replace-this-with-a-real-secret-key-in-production
   DEBUG=True
   ALLOWED_HOSTS=*
   DATABASE_NAME="db.sqlite3"
   EMAIL_HOST_USER=your-email@example.com
   EMAIL_HOST_PASSWORD=your-app-specific-password
   CORS_ALLOW_ALL_ORIGINS=true
   ```

5. **Create database and make migration**
   ```bash
   python3 manage.py migrate
   ```

6. **Create a superuser**
   since phone otp sending is not implemented and email otp sending is disabled by default, you need to create a superuser to be able to login
   ```
   python3 manage.py createsuperuser
   ```
   follow the process and answer the questions to create a superuser

7. **Seeding Sample Data (Optional)**
    If you want to quickly populate your database with dummy users and blog posts for development or UI testing, you can use the provided `script.py` script.

    This script will automatically generate:
    - **20 Users** (with full names, emails, and bio)
    - **10 Posts per User** (200 total posts with mixed `PUBLISHED` and `DRAFT` statuses)
    - Default password for all seed users: `TestPassword123!`
    
    ```bash
    python3 manage.py shell < script.py
    ```

8. **Start the development server:**
   ```bash
   python3 manage.py runserver
   ```
   > 💡 The API server will start on `http://localhost:8000`.

---

### 🎨 2. Frontend Setup

1. **Open a new terminal window and navigate into the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development application:**
   ```bash
   npm run dev
   ```

   > 💡 Open your browser and navigate to `http://localhost:3000`.

---

## 🚧 Status & Roadmap

- [x] Multi-step registration & login flows
- [x] Email OTP verification
- [x] Custom circular avatar cropping
- [x] Rich text post creation & management
- [x] Main feed with infinite scrolling (`useInfiniteQuery`)
- [x] Public profile pages
- [ ] **SMS OTP Integration:** Complete SMS provider integration for phone OTP verification.
- [ ] **Expanded Rich Text:** Support for inline images, code blocks, lists, and links.
- [ ] **Social Feed Filtering:** Incorporate followed user activity directly into the main feed logic.

---