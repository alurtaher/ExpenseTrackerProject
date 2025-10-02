# 💸 Expense Tracker Web Application  

A full-stack web app to track daily expenses, categorize spending, and analyze reports.  
It includes authentication, premium features with payment integration, and AWS cloud deployment.  

---

## 🎥 Demo  

👉 [Watch the demo video](https://www.loom.com/share/4745dbbb9ba64453813ddbc338f33bc6?sid=5fbd1ec2-488e-4434-ac9c-294e3a4ed852)  
  
---

## ✨ Features  

- 🔐 **Authentication** – Signup, Login, and Password Reset (JWT secured)  
- 💰 **Expense Management** – Add, Edit, Delete expenses with category & date  
- 📊 **Reports** – Daily, Monthly analysis  
- 📑 **Pagination** – Dynamic pagination with customizable page size  
- 🌟 **Premium Features** – Leaderboard & advanced reports (via Cashfree payment)  
- 📱 **Responsive UI** – Works seamlessly on desktop & mobile  

---

## 🔧 Tech Stack  

- **Frontend:** Bootstrap, Vanilla JavaScript, Axios  
- **Backend:** Node.js, Express.js, Sequelize (ORM)  
- **Database:** MySQL (via Sequelize), AWS RDS  
- **Authentication:** JWT (JSON Web Token)  
- **Deployment:** AWS EC2 (server), PM2, Nginx  
- **Cloud Services:**  
  - **AWS S3** – Static asset storage (screenshots, frontend files)  
  - **AWS RDS** – Managed MySQL database  
  - **AWS IAM** – Role-based secure access  
  - **AWS Billing & Management Console** – Cost monitoring & resource management  
- **Payment Integration:** Cashfree for premium subscriptions  

---

## 🏗 Project Architecture  

User
↓
Frontend (Bootstrap + JS)
↓
Backend (Node.js + Express + Sequelize)
↓
Database (MySQL on AWS RDS)
    -->AWS S3 – Static files
    -->Cashfree – Premium payments
    -->AWS EC2 + Nginx + PM2 – Deployment

---

## ⚙️ Installation & Setup  

1. **Clone the repository**  
   
   git clone https://github.com//ExpenseTrackerProject.git
   cd ExpenseTrackerProject

2. **Install dependencies**

    npm install


3.**Setup environment variables (.env)**

RESET_PASSWORD_API_KEY
DB_USERNAME=your_db_name
DB_PASSWORD=your_db_password
DB_NAME=your_db_user
SENDER_EMAIL
SECRET_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
BUCKET_NAME


4.**Run database migrations**

npx sequelize db:migrate


5.**Start the application**

node app.js