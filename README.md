# ✅ Task Management System — Frontend

A responsive **React frontend** for managing personal tasks with secure authentication, protected routes, filtering, sorting, progress tracking, and a clean dashboard.

## ✨ Features

- 🔐 Login and registration
- 🛡️ JWT authentication and protected routes
- 📊 Task dashboard
- ➕ Create, edit, and delete tasks
- 📌 Status and priority management
- 📅 Due-date management
- 🔎 Search, filter, and sort tasks
- 📈 Completion progress
- ⏰ Overdue task detection
- 👤 User profile
- 🔔 Toast notifications
- 📱 Responsive UI

## 🧰 Tech Stack

React · JavaScript · Vite · Axios · React Router · CSS

## 🏗️ Application Flow

```text
User
 │
 ▼
React UI
 │
 ├── React Router
 ├── Protected Routes
 └── Axios
       │ REST API
       ▼
Spring Boot Backend
```

## 📁 Project Structure

```text
src/
├── api/
│   └── axios.js
├── components/
│   ├── ProtectedRoute.jsx
│   └── Toast.jsx
├── pages/
│   ├── AddTask.jsx
│   ├── Dashboard.jsx
│   ├── EditTask.jsx
│   ├── Login.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   └── TaskDetails.jsx
├── App.jsx
├── index.css
└── main.jsx
```

## 🚀 Getting Started

```bash
git clone https://github.com/anubhavsahu1232-cmd/task-management-frontend.git
cd task-management-frontend
npm install
npm run dev
```

Configure the backend API URL before running against a deployed backend.

## 🔗 Backend

https://github.com/anubhavsahu1232-cmd/task-management-system

## 📌 Learning Outcomes

- Reusable React components
- Client-side routing and protected routes
- Axios API integration
- Authentication-aware frontend development
- Task filtering, sorting, and state management
- Responsive UI development
