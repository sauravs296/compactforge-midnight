# 🛠️ SETUP GUIDE

Welcome to the **CompactForge** setup guide! Follow these instructions to clone, build, and run the project locally. Because of the nature of Zero-Knowledge proving keys, **deploying and interacting with smart contracts requires a local environment.**

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **Git**
- **1AM Wallet Extension** (installed in your browser and connected to the Preprod network)

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository
Clone the repository to your local machine and navigate into the project directory:
```bash
git clone https://github.com/sauravs296/compactforge-midnight.git
cd compactforge-midnight
```

### 2. Install Dependencies
Install all the required NPM packages (including the Midnight JS SDK and UI libraries):
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following connection strings for the Neon PostgreSQL database. (If you are a judge, you can use the production URLs provided in your submission details):
```env
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?pgbouncer=true"
DIRECT_URL="postgresql://user:password@endpoint.neon.tech/neondb"
```

### 4. Sync the Database
Generate the Prisma client and push the schema to ensure your database is up to date:
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Development Server
Launch the Next.js development server:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running the Test Suite
CompactForge includes a robust unit testing suite using `vitest` that tests API routes, SDK configurations, and core utilities.
```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

You are now ready to start deploying and benchmarking ZK contracts! Proceed to the [USAGE.md](./USAGE.md) for a guide on how to navigate the platform.
