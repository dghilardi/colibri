# CO-LIBRÌ - Comelit Corporate Library

## Overview
CO-LIBRÌ is a Progressive Web App (PWA) designed for managing the corporate library at Comelit. It follows the "With You Always" philosophy, providing a seamless experience for borrowing and discovering books.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (OIDC ready, Credentials for dev)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **PWA**: @serwist/next

## Architecture
The project follows a Clean Architecture approach:
- `app/`: Next.js App Router (Presentation Layer)
- `components/`: UI Components (Presentation Layer)
- `lib/`: Core logic, Utilities, Configuration (Infrastructure/Core Layer)
- `models/`: Database Schemas (Data Layer)
- `services/`: Business Logic (Domain Layer)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/colibri
   ADMIN_EMAILS=admin@example.com
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Development with In-Memory MongoDB
If you don't have a local MongoDB instance, you can run:
```bash
npm run dev:mongo
```
This will start an in-memory MongoDB server and configure Next.js to use it.

## Testing
Run unit tests with Jest:
```bash
npm test
```

## Permissions
Permissions are managed via `conf/library-grants.json` and `ADMIN_EMAILS` environment variable.
- **Admins**: Can manage books and see all data.
- **Users**: Can only see books in libraries they are granted access to.

## License
Private - Comelit
