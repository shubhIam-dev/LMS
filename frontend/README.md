# 🎓 College ERP Portal - Frontend

## 📖 What is this project?

This is the **frontend** (the part you can see and click on) of a College ERP (Enterprise Resource Planning) portal. Think of it as a **student dashboard** where students can:

- 🔑 **Login** to their account
- 📊 **View Dashboard** - See an overview of their academic life
- 📚 **Browse Courses** - See all the courses offered
- 📝 **Check Assignments** - View homework, projects, and deadlines
- 📈 **See Marks** - View their grades and performance

This frontend is built with **React** (a popular JavaScript library for building user interfaces) and **Vite** (a fast tool for building React apps).

---

## 🗂️ Project Structure - What each file/folder does

Here's a tour of all the files in this project, explained in simple human language:

```
frontend/                          # 📁 The main frontend folder
├── index.html                     # 🏠 The main HTML page (like the skeleton of a house)
├── vite.config.js                 # ⚙️ Vite configuration (like the settings for our build tool)
├── package.json                   # 📦 List of all packages/tools we use
├── README.md                      # 📖 This file - the instruction manual
│
└── src/                           # 📁 All our source code lives here
    ├── main.jsx                   # 🚀 The starting point - where the app begins
    ├── App.jsx                    # 🧠 The brain - controls routing and layout
    ├── index.css                  # 🎨 Global styles - paint & wallpaper for the whole app
    ├── App.css                    # 🎨 Component styles - specific styles for each part
    │
    ├── context/                   # 📁 State management (like a central memory bank)
    │   └── AuthContext.jsx        # 🔐 Manages who is logged in
    │
    ├── services/                  # 📁 Communication with backend
    │   └── api.js                 # 🌐 API service - talks to the backend server
    │
    ├── pages/                     # 📁 Each page of our app
    │   ├── LoginPage.jsx          # 🔑 Login page - the front gate
    │   ├── Dashboard.jsx          # 📊 Dashboard - the main notice board
    │   ├── Courses.jsx            # 📚 Courses page - course catalog
    │   ├── Assignments.jsx        # 📝 Assignments page - homework list
    │   └── Marks.jsx              # 📈 Marks page - report card
    │
    └── components/                # 📁 Reusable pieces (like Lego blocks)
        ├── Sidebar.jsx            # 🧭 Sidebar - the navigation menu
        └── ProtectedRoute.jsx     # 🛡️ Route guard - security checkpoint
```

---

## 📄 File-by-file explanation (in human language)

### 🏠 `index.html`
This is the **skeleton** of our web page. It's the basic HTML structure that loads our React app. Think of it as the empty house that our React app will furnish. It has a `<div id="root">` where all our React code gets injected, like a magic box that fills up with our app.

### 🚀 `src/main.jsx`
This is the **starting point** of our app. It's like the ignition key of a car - when you turn it, the engine starts. It imports our main `App` component and renders it inside the `root` div. It also imports the global CSS styles.

### 🧠 `src/App.jsx`
This is the **brain** of our application. It decides:
- What to show on the screen based on the URL (routing)
- Whether to show the sidebar or not
- Which pages need login protection

It uses **React Router** (a GPS for our app) to handle navigation. When you go to `/dashboard`, it shows the Dashboard page. When you go to `/courses`, it shows the Courses page. If someone tries to visit a protected page without logging in, it redirects them to the login page.

### 🔐 `src/context/AuthContext.jsx`
This manages **who is logged in**. Think of it as a security guard that:
- Remembers who you are after you log in
- Checks your credentials when you try to log in
- Forgets who you are when you log out
- Saves your login info in `localStorage` (a small storage box in your browser) so you don't have to log in every time you refresh

### 🌐 `src/services/api.js`
This is the **phone line** to our backend. It contains helper functions that:
- Make calls to the backend server
- Send data in JSON format (a way to organize data that computers understand)
- Handle errors if something goes wrong
- Organizes API calls by feature (user API, course API, assignment API, marks API)

### 🔑 `src/pages/LoginPage.jsx`
The **front gate** of our portal. When you first open the app, you see this page. It has:
- A form with phone number and password fields
- An error message if login fails
- A loading state while checking credentials
- Validation to make sure fields aren't empty

### 📊 `src/pages/Dashboard.jsx`
The **main notice board**. After logging in, this is the first thing students see. It shows:
- A welcome message with the student's name
- Stats cards showing how many courses and assignments they have
- Quick links to other pages (Courses, Assignments, Marks)
- Loading spinner while data is being fetched

### 📚 `src/pages/Courses.jsx`
The **course catalog**. It fetches all courses from the backend and displays them as cards. Each card shows:
- Course name
- Course code (a unique identifier)
- A book emoji icon

If there are no courses, it shows a friendly "No Courses Available" message.

### 📝 `src/pages/Assignments.jsx`
The **assignment notice board**. It shows all assignments with:
- Color-coded type indicator (Homework=Green, Project=Orange, etc.)
- Assignment name
- Topic tags
- Due date and creation date
- Number of questions

### 📈 `src/pages/Marks.jsx`
The **online report card**. It shows:
- Overall performance summary (percentage, total marks)
- A detailed table with marks for each exam
- Color-coded percentages (Green≥80%, Orange≥60%, Yellow≥35%, Red<35%)
- Pass/Fail status based on percentage

### 🧭 `src/components/Sidebar.jsx`
The **navigation menu** on the left side. It contains:
- College logo/branding
- User info (name, role)
- Navigation links to all pages (highlighting the active one)
- Logout button at the bottom

### 🛡️ `src/components/ProtectedRoute.jsx`
The **security checkpoint**. It wraps around pages that need login. It:
- Checks if a user is logged in
- Shows a loading spinner while checking
- Redirects to login if not authenticated
- Shows the page if authenticated

### 🎨 `src/index.css`
The **global paint and wallpaper**. It defines:
- Color theme (primary colors, backgrounds, text colors)
- Font settings
- Base styles for the entire app
- Scrollbar styling
- Dark mode support (coming soon!)

### 🎨 `src/App.css`
The **specific styles** for each component. It has sections for:
- Login page styles (centered card, form styling)
- Sidebar styles (dark purple navigation)
- Dashboard styles (stats cards, quick links)
- Courses styles (course cards)
- Assignments styles (assignment list)
- Marks styles (performance summary, marks table)
- Responsive design (makes it look good on phones)

---

## 🚀 How to run this project

### 1️⃣ Start the Backend (the server)
First, open a terminal and go to the backend folder:

```bash
cd backend
npm install   # Only the first time - installs all required packages
node server.js # Starts the backend server on http://localhost:9000
```

### 2️⃣ Start the Frontend (the app you see)
Open another terminal and go to the frontend folder:

```bash
cd frontend
npm install   # Only the first time - installs all required packages
npm run dev   # Starts the development server on http://localhost:5173
```

### 3️⃣ Open in browser
Go to `http://localhost:5173` in your web browser. You should see the login page!

---

## 🔄 How data flows (The journey of information)

Here's what happens when a student logs in:

1. **Student types their phone number and password** on the Login page
2. **LoginPage sends a request** to the backend via `api.js`
3. **Backend checks the database** for a user with that phone number
4. **If found**, the user data comes back to the frontend
5. **AuthContext saves** the user info and shows the Dashboard
6. **Dashboard fetches courses and assignments** from the backend
7. **Backend returns the data**, and the Dashboard displays it in nice cards

This is called the **request-response cycle** - the frontend asks for data, the backend gets it from the database, and sends it back.

---

## 🧰 Technologies Used

| Technology | What it does | Why we use it |
|------------|-------------|---------------|
| **React** | Builds the user interface | Makes it easy to create interactive pages with reusable components |
| **Vite** | Development tool | Fast building and instant hot-reload when you make changes |
| **React Router** | Manages navigation | Lets us switch between pages without refreshing the browser |
| **CSS** | Styles everything | Makes the app look beautiful and professional |
| **fetch API** | Talks to the backend | Built into browsers, no extra packages needed |

---

## 🎯 Learning Goals

By exploring this project, you'll learn:

- ✅ How to structure a React application with multiple pages
- ✅ How routing works (navigating between pages)
- ✅ How to manage user authentication (login/logout)
- ✅ How to fetch data from a backend API
- ✅ How to handle loading states and errors
- ✅ How to create a responsive design (works on all screen sizes)
- ✅ How to organize code into components, pages, and services
- ✅ How props and state work in React
- ✅ How to use React Context for global state management

---

## 💡 Tips for beginners

1. **Start with LoginPage.jsx** - It's the simplest page and shows how forms work
2. **Then look at Courses.jsx** - It shows how to fetch and display data
3. **Then explore Dashboard.jsx** - It combines multiple API calls
4. **Finally, check AuthContext.jsx** - To understand how login/logout works

Remember: Every component is like a Lego block. Small, reusable, and they all fit together! 🧱

---

*Happy coding! 🚀 If you get stuck, remember: Google is your best friend, and errors are just learning opportunities in disguise! 😊*
