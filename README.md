# WAD2 Course Registration System

## Simple overview of use/purpose

A lightweight web application for managing community education courses, built for the Web Application Development 2 coursework. It allows users to view available courses and register for sessions, while organisers can manage course/class data through an admin panel.

---

## Description

This system is designed for educational institutions or organisations that want to provide a simplified way to display available courses and allow participants to register online. The application includes a clean separation of public-facing pages and an admin dashboard.

Users can view details of courses and register for individual sessions or the entire course. Organisers can log in, add or remove courses and classes, and manage participant lists.

---

## Getting Started

### Dependencies

Before installing the program, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (comes with Node)
- Git (optional, for version control)
- A modern browser (Chrome, Firefox, etc.)

---

### Installing

1. Clone the repository:

```bash
git clone https://github.com/ZakharMarusiak/ScotDance.git
cd wad2-course-app
```

2. Install dependencies:

```bash
npm install
```

3. Create required folders (optional, if not included):

```bash
mkdir data
mkdir public/photos/courses
mkdir public/photos/website
```

---

### Executing program (local dev)

To run the application locally:

```bash
npm run dev
```

This uses `nodemon` to auto-restart the server on changes.  
The app will run at: http://localhost:3000

> For production or Heroku deployment, use:

```bash
node index.js
```

---

### Additional Notes

- Data is stored locally in `.db` files (NeDB)
- No external databases are required
- Environment variables are not used (no `.env` file)
- Auth is handled via JWT (httpOnly cookie)