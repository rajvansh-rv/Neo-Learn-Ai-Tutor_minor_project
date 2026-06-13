# NeoLearn.AI - Futuristic AI Tutor & Career Companion

NeoLearn.AI is an all-in-one educational and career platform designed to act as a futuristic, personalized AI-powered learning companion. It integrates interactive learning roadmaps, deep AI explanations, intelligent resume ATS analysis, automated internship discovery, and a multimedia chat interface (including support for PDF OCR and image analysis) with a sleek, space-themed dark mode user interface.

---

## 🚀 Key Features

*   **⚡ AI Tutor Chat**: Ask anything and receive interactive, simple, and detailed explanations of complex topics.
*   **🎙️ Voice Assistant**: Interactive hands-free learning with voice-to-text queries.
*   **🗺️ Learning Roadmaps**: Generate customized step-by-step roadmaps tailored to your current skill level, target duration, and available hours per week.
*   **📄 ATS Resume Analyzer**: Upload your resume (PDF/DOCX) to get a comprehensive compatibility score, keyword recommendations, formatting diagnostics, spelling/grammar reviews, and AI-driven suggestions for improvement.
*   **💼 Internship Finder**: Search for global, remote, or localized internship opportunities instantly in specific technological domains.
*   **📚 Resource Recommendation**: Automatically fetches web links, guides, and free documentation relevant to your chat queries.
*   **🔒 Secure Authentication**: Robust signup/login workflows using JWT credentials with encrypted passwords.
*   **📂 Multi-modal PDF & Image Analysis**: Upload files, scan PDFs, and analyze images using AI-powered OCR and vision capabilities.

---

## 🛠️ Tech Stack

### Frontend
*   **Core**: HTML5, Javascript (ES6+)
*   **Styling**: Tailwind CSS (CDN-loaded configuration), Custom CSS for futuristic visual glows and glassmorphism.
*   **External Assets**: Google Fonts (Inter, Space Grotesk), FontAwesome Icons
*   **Client-Side PDF Parsing**: PDF.js (for fallback OCR processing)

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB & Mongoose ODM
*   **APIs**: OpenAI API (for roadmaps, explanations, chat, vision, and ATS analysis)
*   **Utilities**:
    *   `jsonwebtoken` (Session security & auth)
    *   `bcryptjs` (Password hashing)
    *   `multer` (Multipart file uploading)
    *   `pdf-parse`, `pdfreader`, `mammoth` (PDF/Word document processing)
    *   `cors`, `dotenv` (CORS handling, environment configuration)

---

## ⚙️ Environment Variables

The backend application requires the following environment variables. Create a `.env` file inside the `backend/` directory using this template:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/neolearn
JWT_SECRET=your_jwt_strong_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 📦 Installation & Setup

Before running the application, ensure you have **Node.js** (v16+) and **MongoDB** installed and running locally.

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the Node package dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` configuration file as detailed in the Environment Variables section.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. The frontend is built on vanilla HTML, CSS, and JS, so it can be served using any lightweight HTTP server. For example:
   ```bash
   npx http-server -p 3000
   ```

---

## 🚀 Running the Project

### Start the Backend Server
From the `backend/` directory, run:
```bash
# Start in development mode (using nodemon for hot-reload)
npm run dev

# Start in production mode
npm start
```
*The API will start running at:* `http://localhost:5000`

### Start the Frontend Server
From the `frontend/` directory, run:
```bash
npx http-server -p 3000
```
*The user interface will be accessible at:* `http://localhost:3000`

---

## 🌐 Deployment Instructions

### Backend Deployment (API)
The backend can be deployed on services like **Render**, **Railway**, or **Heroku**:
1. Connect your GitHub repository to the hosting platform.
2. Select the base directory as `backend/`.
3. Set the start script to `npm start`.
4. Configure all environment variables in the host's settings panel (PORT, MONGO_URI, JWT_SECRET, OPENAI_API_KEY).

### Frontend Deployment (UI)
Since the frontend consists of static assets, it can be deployed on **Vercel**, **Netlify**, or **GitHub Pages**:
1. Connect the repository.
2. Set the build directory / root directory to `frontend/`.
3. Set the build command to `None` (empty) and install command to `None`.
4. Deploy the static build. Ensure the frontend's API calls (in `script.js` / HTML files) are configured to point to your live deployed backend URL instead of `localhost:5000`.
