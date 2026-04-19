# ShareSpare 🚗📚⚽

ShareSpare is a modern mobile platform designed to connect people for sharing cabs, forming study groups, and organizing sports activities. It provides a real-time, interactive environment where users can post, accept, and chat about shared requests.

---

## 🏗️ Project Architecture & Folder Structure (Teacher Review Guide)

This application uses a thoroughly decoupled architecture, separating the client interface from the database and backend services. Here is an overview of the folders and what the files inside are used for:

### 📱 1. Frontend (React Native / Expo)
The mobile user interface is built using React Native and Expo.
*   **`app/`**: This is the main Frontend routing folder. 
    *   *What's inside:* `_layout.tsx` (navigation structure), `login.tsx` (authentication screen), and the `(tabs)/` directory which contains the core screens: `index.tsx` (Home Feed), `explore.tsx` (Search Engine), `chat.tsx` (Real-time Messaging), `post.tsx` (Creating Requests), and `history.tsx` (User Activity).
*   **`components/`**: Reusable frontend UI building blocks.
    *   *What's inside:* `RequestCard.tsx` (the complex card UI for displaying requests with member counts and actions), `CategoryBadge.tsx`, and layout wrappers.
*   **`constants/` & `store/`**: 
    *   *What's inside:* `Colors.ts` defines the app's visual theme. `AppStore.ts` stores frontend business logic, TypeScript definitions, and UI helper functions for categories.

### ⚙️ 2. Backend config (Supabase BaaS)
Instead of a traditional Node.js server, this project utilizes Supabase as a Backend-as-a-Service (BaaS) for real-time APIs and Authentication.
*   **`lib/` folder**: 
    *   *What's inside:* The `supabase.ts` file. This connects the frontend to the cloud backend. It configures the secure client using API Keys, manages the authentication session, and provides the methods to read/write to the database without exposing secrets.

### 🗄️ 3. Database (PostgreSQL)
The data persistence layer is handled by a robust PostgreSQL relational database.
*   **`supabase_schema.sql` file**: This file represents the entire database architecture.
    *   *What's inside:* It establishes the core tables (`profiles`, `requests`, `request_members`, and `notifications`). 
    *   *Security & Logic:* It contains **Row Level Security (RLS)** policies that enforce back-end authorization (e.g., ensuring users can only delete their own requests) and **Postgres Triggers/Functions** (like `handle_new_user()`) that automate database tasks upon user signup.

---

## 🚀 How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase connection strings:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the App:**
   ```bash
   npx expo start
   ```
   *Press `a` to open on Android, or `i` to open on iOS.*
