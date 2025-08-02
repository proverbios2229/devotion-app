# 📖 Devotion App

A simple web app for recording daily devotions and reflecting on Bible verses.

## ✨ Features

- ✅ Add/Edit/Delete your devotion records  
- 🔍 Search through past devotions  
- 📅 Select the date for each devotion (default: today)  
- 📖 View Bible verses from [bible-api.com](https://bible-api.com/)  
- 🕊️ Simple, clean UI for focused reflection  

## 🛠️ Tech Stack

- **Frontend:** React (Hooks, fetch API)  
- **Backend:** Django + Django REST Framework  
- **External API:** [Bible API](https://bible-api.com/)  
- **Database:** SQLite (for local development)

## 🚀 Getting Started

1. Clone this repository:

```bash
git clone https://github.com/your-username/devotion-app.git
cd devotion-app
```

2. Start the backend
```bash
cd backend
python manage.py migrate
python manage.py runserver
```

3. Start the frontend
```bash
cd ../frontend
npm install
npm start
```

Access the app at: http://localhost:3000

📂 Folder Structure
```bash
devotion-app/
├── backend/         # Django backend (API & DB)
│   ├── manage.py
│   └── ...
├── frontend/        # React frontend
│   ├── src/
│   └── ...
└── README.md
```

🙏 Purpose
This app is a personal tool for spiritual journaling and Scripture meditation.
I built it to improve my faith walk and to grow as a full-stack developer.
