# Gaming Haven Z

A modern web application for discovering and collecting video games with full authentication support, built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core Features
- **Game Discovery**: Search and browse video games using the IGDB API
- **Game Collections**: Save your favorite games to a personal collection
- **User Authentication**: Complete sign up/sign in system with Supabase
- **User Profiles**: Editable user profiles with usernames and bios
- **Cross-Device Sync**: Collections sync across all your devices
- **Responsive Design**: Beautiful UI that works on desktop and mobile

### Search & Discovery
- **Real-time Search**: Dynamic search with debounced API calls
- **Search Suggestions**: Popular games appear when focusing the search input
- **Game Details**: Comprehensive game information including ratings, release dates, platforms, and screenshots
- **Similar Games**: Discover related games on detail pages
- **Smart URL Routing**: Supports both slug-based and ID-based game URLs

### User Experience
- **Toast Notifications**: Beautiful feedback for all user actions
- **Loading States**: Smooth loading indicators throughout the app
- **Error Handling**: Graceful error management with user-friendly messages
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Mobile Hamburger Menu**: Responsive navigation with hamburger menu on mobile devices

### Authentication & Security
- **Email/Password Authentication**: Secure sign up and sign in
- **User Profiles**: Automatic profile creation on sign up
- **Session Management**: Persistent sessions with automatic refresh
- **Row Level Security**: Database-level security with Supabase RLS
- **Service Role API**: Secure server-side operations
- **Authentication-Only Collections**: Games can only be added/removed when authenticated

### Performance & SEO
- **Image Optimization**: Next.js Image component with proper sizing
- **Dynamic Metadata**: Open Graph and Twitter Card support for game pages
- **Caching**: API response caching for better performance
- **Code Splitting**: Automatic code splitting for optimal loading
- **SEO Optimized**: Proper meta tags and semantic markup

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- IGDB API credentials

### 1. Clone the Repository
```bash
git clone <repository-url>
cd aerolab_game_collector
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# IGDB API Configuration
NEXT_PUBLIC_IGDB_CLIENT_ID=your_igdb_client_id
IGDB_CLIENT_SECRET=your_igdb_client_secret

# Base URL for metadata generation
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "gaming-haven-z")
5. Enter a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

#### Get Your Supabase Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy your **Project URL** and **anon public key**
3. Copy your **service_role key** (keep this secret!)
4. Add these to your `.env.local` file

#### Set Up the Database
1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire contents of `database-setup.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create all necessary tables, policies, and functions

#### Configure Authentication Settings
1. In your Supabase dashboard, go to **Authentication > Settings**
2. Add your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### 5. Get IGDB API Credentials
1. Go to [IGDB API](https://api.igdb.com/) and create an account
2. Create a new application
3. Get your **Client ID** and **Client Secret**
4. Add these to your `.env.local` file

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
aerolab_game_collector/
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── api/               # API routes
│   │   │   ├── games/         # Game details API
│   │   │   ├── search/        # Search API with popular games support
│   │   │   └── user/          # User collections API
│   │   ├── game/              # Game detail pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── Auth/              # Authentication components
│   │   │   ├── AuthModal.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   └── MobileMenu.tsx # Mobile hamburger menu
│   │   ├── GameCard.tsx       # Game card component
│   │   ├── SearchBar/         # Search functionality
│   │   ├── SortTabs/          # Collection sorting
│   │   └── Logo/              # Application logo
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── hooks/                 # Custom React hooks
│   │   ├── useGameCollection.ts
│   │   └── useGameSearch.ts
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts        # Supabase configuration
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript type definitions
│       └── game.ts
├── public/                    # Static assets
├── database-setup.sql         # Complete database setup
├── env.example               # Environment variables template
├── package.json
└── README.md
```

## Key Technologies

### Frontend
- **Next.js 15**: React framework with app router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **IGDB API**: Video game database and API
- **Next.js API Routes**: Server-side API endpoints

### Authentication & Security
- **Supabase Auth**: Complete authentication system
- **Row Level Security**: Database-level security
- **Service Role API**: Secure server operations

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **React Hot Toast**: Toast notifications

## How It Works

### Authentication Flow
1. **Sign Up**: Users create accounts with email/password
2. **Profile Creation**: Automatic profile creation via database trigger
3. **Session Management**: Persistent sessions with automatic refresh
4. **User Menu**: Profile management and sign out functionality

### Game Collection System
1. **Search Games**: Real-time search with IGDB API
2. **Add to Collection**: Authenticated users can add games
3. **Cross-Device Sync**: Collections stored in Supabase
4. **Sort & Filter**: Multiple sorting options for collections

### Security Implementation
1. **API Authentication**: All collection operations require authentication
2. **Row Level Security**: Users can only access their own data
3. **Service Role API**: Secure server-side operations bypass RLS
4. **Token Validation**: Server-side token verification

### Mobile Experience
1. **Responsive Design**: Adapts to all screen sizes
2. **Hamburger Menu**: Mobile-friendly navigation
3. **Touch Optimized**: Optimized for touch interactions
4. **Progressive Enhancement**: Works on all devices

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### Environment Variables for Production
Make sure to update your environment variables for production:
```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## API Endpoints

### Game Search
- `GET /api/search?q={query}&limit={limit}`
- Returns search results from IGDB API
- Special query: `q=popular` returns popular games

### Game Details
- `GET /api/games/{id}`
- Returns detailed game information with similar games

### User Collections
- `GET /api/user/collections` - Get user's collection
- `POST /api/user/collections` - Add game to collection
- `DELETE /api/user/collections?game_id={id}` - Remove game from collection

## Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Global styles in `src/app/globals.css`
- Component-specific styles in individual components

### Features
- Add new game platforms
- Implement game ratings and reviews
- Add social features (sharing, following)
- Implement game recommendations

## Troubleshooting

### Common Issues

#### Authentication Issues
- Verify Supabase environment variables
- Check if database setup script was run
- Ensure authentication settings are configured

#### API Issues
- Verify IGDB API credentials
- Check API rate limits
- Ensure environment variables are set

#### Database Issues
- Run the `database-setup.sql` script
- Check RLS policies are enabled
- Verify user profiles exist

#### Game Detail Page Issues
- Check if the game slug is valid
- Verify IGDB API is responding
- Check browser console for error messages

### Debug Mode
Enable debug logging by checking the browser console and server logs for detailed error information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [IGDB](https://api.igdb.com/) for the comprehensive game database
- [Supabase](https://supabase.com/) for the excellent backend service
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

**Gaming Haven Z** - Discover, collect, and enjoy your favorite video games!
