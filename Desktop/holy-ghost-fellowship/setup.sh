#!/bin/bash

echo "🚀 Setting up Holy Ghost Fellowship Platform..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found"
    echo "📝 Creating .env.example as template..."
    echo "Please copy .env.example to .env.local and fill in your values"
    echo ""
    echo "# Required environment variables:"
    echo "DATABASE_URL=postgresql://username:password@localhost:5432/holy_ghost_fellowship"
    echo "NEXTAUTH_SECRET=your-secret-key-here-change-in-production"
    echo "NEXTAUTH_URL=http://localhost:3000"
fi

# Generate Prisma client
echo "🗄️  Setting up database..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated successfully"

# Check if database connection works
echo "🔍 Checking database connection..."
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env.local"
    echo "💡 Make sure PostgreSQL is running and the database exists"
else
    echo "✅ Database schema pushed successfully"
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 Don't forget to:"
echo "  - Set up your database connection"
echo "  - Configure authentication providers (optional)"
echo "  - Update environment variables"
echo ""
echo "Happy coding! 🙏"
