# Collaborative Canvas

A real-time collaborative notebook application built with Next.js and MongoDB.

## Prerequisites

- Node.js 16.8 or later
- npm or yarn package manager
- MongoDB database (local or Atlas)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/SHARJIDH/CollabCanva.git
cd collaborative-canvas
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:

```env
# MongoDB connection string
# Example for local: mongodb://localhost:27017/your-database
# Example for Atlas: mongodb+srv://<username>:<password>@cluster0.mongodb.net/your-database
MONGODB_URI=your_mongodb_connection_string

# NextAuth secret - You can generate one using: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

### Required Variables

- `MONGODB_URI`: Your MongoDB connection string

  - Format for local MongoDB: `mongodb://localhost:27017/your-database`
  - Format for MongoDB Atlas: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/your-database`

- `NEXTAUTH_SECRET`: A secret string used to encrypt session tokens
  - Must be at least 32 characters long
  - You can generate one by running: `openssl rand -base64 32`

## Additional Information

- The application uses NextAuth.js for authentication
- MongoDB is used as the database
- Changes are saved in real-time to the database
- Multiple users can collaborate on the same notebook simultaneously
