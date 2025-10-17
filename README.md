# 🌍 GoAbroad

**GoAbroad** is a comprehensive platform that assists students in fulfilling their dreams of studying abroad. It simplifies the entire journey—from shortlisting colleges to handling documentation, writing support content (like SOPs and LORs), form filling, and application tracking.

## 🚀 Features

- 🎯 Dream College Management: Find and manage your target colleges
- 📝 Document Assistance: SOPs, LORs, resumes, and other essential docs
- 📑 Form Filling Support: Simplify the tedious parts of application processes
- 📊 Status Management: Stay updated with each application's progress
- 🖥️ Full-stack Architecture: Built with performance and scalability in mind

## ⚙️ Tech Stack

| Tech              | Description                                     |
|-------------------|-------------------------------------------------|
| **Node.js**       | Server-side development using Express.js        |
| **React.js**      | Front-end SPA with a modern and responsive UI   |
| **MongoDB**       | NoSQL database for flexible data modeling       |
| **Docker**        | Containerization of the full-stack app          |
| **Docker Compose**| Simplified orchestration of multi-container apps|
| **ShadCN UI**     | Clean and customizable UI component library     |

## 📁 Project Structure

```
GoAbroad/
├── .github/          # CI/CD workflows
├── client/           # React frontend
├── server/           # Node.js backend
├── nginx/            # Reverse proxy configuration
└── README.md         # Project documentation
```

## 🛠 How to Run the Project

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Git installed

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd GoAbroad
```

### Step 2: Backend Setup

1. Navigate to server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in server folder:
```env
ENV=development
PORT=5000
SERVER_URL=http://localhost:5000
DATABASE_URL=mongodb://localhost:27017/goabroad
ADMIN_URL=http://localhost:5173/

ACCESS_TOKEN_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OTP_SECRET=your-otp-secret
OTP_EXPIRES_MINUTES=10

# Payment Integration
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# File Upload
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url

# Firebase
FIREBASE_CONFIG_PATH=./src/firebase-admin.json

# Stream API
STREAM_API_KEY=your_stream_api_key
STREAM_TOKEN=your_stream_token
```

4. Start the backend server:
```bash
npm run dev
```
Server will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. Open new terminal and navigate to client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in client folder:
```env
VITE_SERVER_URL=http://localhost:5000

# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key

# Firebase Configuration
VITE_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_PUBLIC_FIREBASE_APP_ID=your_app_id
VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Payment
RAZORPAY_KEY_ID=your_razorpay_key
```

4. Start the frontend:
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### Step 4: Database Setup

1. Make sure MongoDB is running on your system
2. The application will automatically create the database and collections
3. Default database name: `goabroad`

## 🚀 Quick Start

After setup, access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: MongoDB on default port 27017

## 🛠 Developer Experience Enhancements

- **ESLint**: Maintain code quality with consistent linting
- **Prettier**: Auto-formatting for cleaner, more readable code
- **Husky**: Git hooks to prevent bad commits and pushes
- **Commitlint**: Enforce commit message conventions (Conventional Commits)

## 📝 Important Notes

1. **Environment Variables**: All sensitive data should be stored in environment variables
2. **Database**: MongoDB will automatically create collections when first accessed
3. **Ports**: Make sure ports 5000 (backend) and 5173 (frontend) are available
4. **API Keys**: You'll need valid API keys for third-party services to work properly

## 🔧 Troubleshooting

### Common Issues:

**Backend not starting:**
- Check if MongoDB is running
- Verify all environment variables are set
- Check if port 5000 is available

**Frontend not loading:**
- Make sure backend is running first
- Check if port 5173 is available
- Verify VITE_SERVER_URL points to correct backend URL

**Database connection issues:**
- Ensure MongoDB is installed and running
- Check DATABASE_URL in server/.env file
- Verify MongoDB service is started

## 👨‍💻 Maintained By

**FutureDesks** - Active development and feature updates

## 📞 Support

For any issues or questions regarding setup and deployment, please contact the development team.

