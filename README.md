# VedaAI – AI Assessment Creator

<p align="left">
  <a href="https://vedaai-ashishsoni.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Demo-View_Project-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

This repository contains the complete full-stack implementation of the **VedaAI Full Stack Engineering Assignment**. It is an AI-powered assessment creator that lets teachers generate structured question papers dynamically using LLMs, view the output cleanly, and download them as PDFs.

The project perfectly matches the provided Figma UI specifications and features a robust, asynchronous background generation pipeline built with BullMQ, Redis, and WebSockets.

---

## 🏗️ Architecture Overview

The system is separated into two decoupled services: a modern React frontend and a scalable async backend.

### **Frontend (Next.js)**
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS (Pixel-perfect matching of Figma designs)
- **State Management**: Zustand simplifies the multi-step assignment form state and manages global WebSocket connection status.
- **Real-time UX**: Connects to the backend via WebSockets. When a user submits an assignment, the UI immediately updates to a "generating" state and listens for incremental changes and the final completion event.

### **Backend (Node.js + Express)**
- **Framework**: Node.js + Express (TypeScript)
- **Database**: MongoDB (Mongoose) for securely storing assignment requests and AI-generated sections.
- **Queue System**: Redis + BullMQ. Because LLM text generation is inherently slow and prone to timeouts, we do *not* block the Express API request. 
  1. The API creates a "generating" DB entry and immediately enqueues a `BullMQ` job.
  2. A dedicated BullMQ Worker processes the assignment, structures the prompt, interacts with the LLM (Groq), parses the JSON response, and writes it back to MongoDB.
- **Real-time Engine**: `ws` package running alongside Express broadcasts job status tracking directly to the Next.js client.

---

## 💡 Key Features & Bonus Requirements Completed

- **Fully functional AI Generation**: Accurately respects difficulty, marks, and question types to deliver structured sections (e.g. Multiple Choice, Short Answer, etc.).
- **Background Jobs**: Completely asynchronous LLM pipeline via Redis & BullMQ.
- **Structured Rendering**: Emulates real exam papers perfectly. The raw LLM response is strictly parsed into JSON objects (Sections -> Questions) rather than rendering a raw markdown blob.
- **Bonus - PDF Export**: A single-click **Download PDF** feature using `html2pdf.js`, perfectly retaining the original hierarchy, typography, and styling for standard A4 printing.
- **Bonus - Visually Distinct Difficulty Tags**: Interactive styling mapping difficulties to distinct visual badges.
- **Bonus - Real-time Loading UX**: WebSockets continuously broadcast progress (10% -> 40% -> 80% -> 100%) back to the user to avoid blind loading spinners.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js**: v18+
- **Database**: A MongoDB instance (Local or Atlas)
- **Redis**: A running Redis instance (Local or Upstash)
- **LLM Key**: A valid Groq API Key (or alternate LLM key set up via your `.env`)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd vedaai-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:  
   Create a `.env` file (copy from `.env.example` if available) and add:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/vedaai
   REDIS_URL=redis://localhost:6379
   GEMINI_API_KEY=your_llm_api_key_here
   ALLOWED_ORIGINS=http://localhost:3000
   ```
4. Start the development environment (runs both API Server and Worker concurrently):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../vedaai-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:  
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=ws://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## 🧠 Approach & Prompt Engineering

The most significant technical hurdle in LLM-driven generation is forcing strict JSON schemas. 
1. **Structuring**: The prompt is meticulously structured to accept dynamic inputs (custom user topics, total marks, exactly X questions per section). 
2. **Parsing**: The pipeline requires the AI to spit out pure JSON arrays without markdown wrappers. The Worker parses this into validated schemas before storing to MongoDB, ensuring the Frontend Output UI never experiences formatting breaks.
3. **Optimistic Updates**: Since LLMs can take up to 20 seconds to stream large question papers, the queue + websocket model guarantees the frontend remains fully interactive while the heavy lifting happens out of sight.
