# 🌦️ Task Management API  

A Task Management REST API built with **Node.js, Express, and MongoDB**.  
It includes **JWT-based authentication**, **task CRUD operations**, and a unique **weather integration** that restricts outdoor task completion during bad weather and provides dynamic suggestions.  

---

## 🚀 Features  
- User authentication (Register, Login, Profile)  
- Create, Read, Update, Delete (CRUD) tasks  
- Mark tasks as completed (with **weather restrictions** for outdoor tasks)  
- Task analytics summary (total, completed, average completion time)  
- Weather-based dynamic suggestions  
- Rate limiting (10 requests per minute per IP)  

---

## ⚙️ Setup Instructions  

1. Clone the repo, install dependencies, configure `.env`, and start the server:  

```bash
git clone https://github.com/your-username/task-management-api.git

npm install

# Create a .env file and add the following:
SECRET_TOKEN='JWTSECRET'
MONGO_URI=mongodb+srv://deveshdighe30:JustForTest@cluster0.yoz25o7.mongodb.net/stfx
OPENWEATHERAPI=20d5138e83e9d379f0aada223f8c5e65
PORT=4000

# Start the server
node server.js
