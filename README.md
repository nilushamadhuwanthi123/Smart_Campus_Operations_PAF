# Smart_Campus_Operations_PAF
IT3030 – Programming Applications and Frameworks (2026, Semester 1)
SLIIT – Faculty of Computing | Group 113

📌 Project Overview
A full-stack web system for managing university facility bookings and maintenance/incident ticketing.

Built with Spring Boot REST API + React (Vite) client, secured with OAuth 2.0 (Google Sign-In), and version-controlled via GitHub Actions CI/CD.

👥 Team Members & Contributions
Member	  Index No.	    Module Responsible
Member 1	T23569386 	Notifications + role management + OAuth integration improvements
Member 2	T23305496 	Booking workflow + conflict checking
Member 3	IT23556416	Incident tickets + attachments + technician updates
Member 4	I23542938 	Facilities catalogue + resource management endpoints

🛠️ Tech Stack
Layer	Technology
Backend	Java 17, Spring Boot 3.x
Frontend	React 18 (Vite), Axios, React Router
Database	MySQL 8.x
Auth	OAuth 2.0 (Google Sign-In), Spring Security
CI/CD	GitHub Actions
Testing	JUnit 5, Postman
🚀 Quick Start with Configuration Templates
This project uses template files for configuration to keep secrets out of version control. Follow these steps to set up your local environment:

1.⁠ ⁠Backend Setup
Navigate to /backend/src/main/resources/.
Copy application.properties.example to application.properties.
Fill in your local MySQL credentials and Google OAuth keys.
2.⁠ ⁠Frontend Setup
Navigate to the /frontend/ root.
Copy .env.example to .env.
Ensure VITE_API_BASE_URL matches your backend server address.
⚙️ Prerequisites
Build and run:
   mvn clean install
   mvn spring-boot:run
The API will be available at:
   http://localhost:8080/api/v1
💻 Frontend Setup (React + Vite)
Navigate to the frontend folder:
   cd frontend
Install dependencies:
   npm install
Create a .env file in the frontend root:
   VITE_API_BASE_URL=http://localhost:8080/api/v1
Start the development server:
   npm run dev
Open in browser:
   http://localhost:5173
🔐 OAuth 2.0 Setup (Google Sign-In)
Go to Google Cloud Console
Create a new project → Enable Google+ API
Go to Credentials → Create OAuth 2.0 Client ID
Set the authorized redirect URI:
   http://localhost:8080/login/oauth2/code/google
Copy the Client ID and Client Secret into application.properties
📁 Project Structure
it3030-paf-2026-smart-campus-groupXX/
│
├── backend/                   # Spring Boot REST API
│   ├── src/
│   │   └── main/java/com/groupXX/smartcampus/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── model/
│   │       ├── dto/
│   │       ├── exception/
│   │       └── config/
│   └── pom.xml
│
├── frontend/                  # React Web Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── routes/
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
│
└── README.md
🧪 Running Tests
Backend unit tests:

cd backend
mvn test
Postman collection:
Import docs/SmartCampus_Postman_Collection.json into Postman to test all API endpoints.

🔄 GitHub Actions CI
The CI pipeline runs automatically on every push to main and develop branches.

It performs:

Maven build + test (backend)
npm install + build (frontend)
See .github/workflows/ci.yml for full configuration.

📋 Key API Endpoints
Method	Endpoint	Description	Member
GET	/api/v1/resources	List all resources	Member 1
POST	/api/v1/resources	Add a new resource	Member 1
GET	/api/v1/bookings/{id}	Get booking by ID	Member 2
POST	/api/v1/bookings	Create a booking	Member 2
GET	/api/v1/tickets	List all tickets	Member 3
POST	/api/v1/tickets	Create incident ticket	Member 3
GET	/api/v1/notifications	Get user notifications	Member 4
Full endpoint list is available in the Final Report.

📄 Submission Details
Report: IT3030_PAF_Assignment_2026_Group113.pdf
Deadline: 27th April 2026, 11:45 PM (GMT +5:30)
Submission via: Courseweb
⚠️ Academic Integrity
AI-generated code (ChatGPT, Gemini, etc.) has been used and is disclosed in the final report as required by assignment guidelines. All members can independently explain their own code and are prepared for viva.
