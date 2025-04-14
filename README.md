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



## Features Beyond Technical Requirements

This application includes several enhancements that go **beyond the original system specification** to improve usability, maintainability, and security.

| Feature | Description |
|--------|-------------|
| **Automatic price adjustment on course deregistration** | When a class is deleted, the system automatically subtracts its price from associated course registrations, and removes course registrations if price reaches zero. |
| **Smart registration replacement** | If a user is already registered for one or more classes and attempts to register for the whole course, their class registrations are automatically replaced with a unified course registration. |
| **Conflict prevention for overlapping classes** | The system prevents creation of classes that overlap in time and location with existing ones, even though this is not required by the specification. |
| **Hiding completed or empty courses from the public page** | Courses that have ended or contain no classes are automatically hidden from public view, maintaining a clean and relevant user experience. |
| **Included class ID tracking for course-level registrations** | Course-level registrations store which specific classes are included, allowing accurate registration display per class. |
| **Bootstrap-based confirmation modals for deletions** | All dangerous actions (course/class/registration deletions) are confirmed by the user to prevent accidental loss of data. |
| **Visual badge indicators for status** | All course and class entries show real-time status (Upcoming, Active, Ended) using Bootstrap badges. |
| **Course images** | Each course allows the upload and display of a cover image to visually enhance the UI (not required in specification). |
| **Toggle course visibility manually** | Admins can control whether a course is publicly visible via a button on the admin page. Visibility is stored in the database. |
| **Hidden login route for security** | The admin login page is located at `/keyboard-cat-zone-login`, is not shown in navigation, and must be accessed manually. This reduces the risk of unauthorized access by obscuring the route. |