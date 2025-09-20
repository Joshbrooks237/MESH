# Holy Ghost Fellowship 🌟

A global Christian community platform that connects believers worldwide for prayer, fellowship, Bible study, and spiritual growth.

## 🚀 Features

- **Prayer Requests**: Share prayer needs and find prayer partners globally
- **Fellowship Groups**: Join small groups, Bible study circles, and ministry teams
- **Real-time Chat**: Connect instantly with believers through messaging
- **Bible Study Tools**: Access devotionals, study guides, and study groups
- **Virtual Events**: Join prayer meetings, worship sessions, and fellowship events
- **Church Directory**: Find churches and connect with local congregations worldwide
- **Christian Profiles**: Share your faith journey and spiritual gifts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: NextAuth.js with multiple providers
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io for chat and live features
- **UI Components**: Custom component library with Radix UI

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema (uses SQLite by default for easy setup)
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (SQLite for easy setup, change to PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Email (for email verification)
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASS=""
EMAIL_FROM=""
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/         # NextAuth configuration
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Main dashboard
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # Reusable components
│   ├── providers.tsx    # React context providers
│   └── ui/              # UI component library
├── lib/                 # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Helper functions
└── prisma/              # Database schema
    └── schema.prisma    # Prisma schema
```

## 🎨 Design System

The platform uses a custom design system built on Tailwind CSS:

- **Primary Colors**: Blue tones for trust and spirituality
- **Typography**: Clean, readable fonts for all screen sizes
- **Components**: Consistent UI components with proper accessibility
- **Responsive**: Mobile-first design that works on all devices

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma migrate   # Create and run migrations
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Features in Development

- [ ] Real-time chat system
- [ ] Prayer partner matching algorithm
- [ ] Bible study tools integration
- [ ] Virtual event hosting
- [ ] Global church directory
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for the global Christian community
- Inspired by the need for deeper spiritual connections in our digital age
- Dedicated to helping believers grow in faith together

## 📞 Support

For support, questions, or contributions:
- Create an issue on GitHub
- Join our community discussions
- Contact the development team

---

*"For where two or three gather in my name, there am I with them." - Matthew 18:20*

May this platform be a blessing to the global body of Christ! 🙏