# JewelAI - Business Intelligence for Jewellery Businesses

An AI-powered business intelligence platform designed specifically for jewellery businesses in India. Get actionable insights to reduce deadstock, optimize inventory decisions, and stay ahead of market trends.

## Features

### 🏠 Dashboard
- **AI Daily Insights**: Personalized daily recommendations powered by Google Gemini AI
- **KPI Overview**: Real-time metrics including:
  - Total Stock Value
  - Ageing Stock Analysis
  - Predicted Deadstock
  - Fast Moving Items
- **Stock Distribution Charts**: Visual breakdown of inventory by category (Gold, Silver, Diamond, Platinum)
- **AI Recommendations**: Context-aware suggestions with confidence scores and impact assessment
- **Quick Actions**: Fast access to key features

### 📦 Inventory Management
- **Category-Level Tracking**: Monitor stock levels across different jewellery categories
- **Sales Velocity Analysis**: Track 30-day sales performance for each category
- **Ageing Stock Detection**: Identify inventory that's been sitting too long
- **Deadstock Risk Assessment**: AI-powered predictions of items at risk of becoming deadstock
- **Reorder Suggestions**: Intelligent recommendations for when to restock
- **Trend Analysis**: Visual indicators showing rising, falling, or stable trends
- **Search Functionality**: Quickly find specific inventory categories

### 📊 Analytics
- **Custom Analytics Builder**: Modular system to build personalized analytics dashboards
- **Demand Prediction**: Forecast future demand based on historical data
- **Stock Ageing Breakdown**: Visual representation of inventory age distribution
- **Category Performance**: Compare revenue and profit across different categories
- **Interactive Charts**: Line charts, bar charts, and pie charts for data visualization
- **Module Toggle System**: Enable/disable analytics modules based on your needs

### 🌐 Market Overview
- **Trending Categories**: Real-time insights into what's trending in the Indian jewellery market
- **Category Trends**: Historical interest data for Gold, Silver, and Diamond categories
- **Search Interest Tracking**: Monitor overall market search interest over time
- **Seasonal Insights**: AI-generated predictions for upcoming seasonal trends and opportunities
- **Gemini AI Integration**: Powered by Google's Gemini API for intelligent market analysis
- **Data Caching**: Efficient caching strategy to minimize API calls

### 🔍 Keyword Intelligence
- **Keyword Research**: Analyze search trends for specific jewellery products
- **Interest Over Time**: Visual charts showing search interest trends
- **Related Searches**: Discover related search phrases and their demand levels
- **AI Recommendations**: Get actionable insights with confidence scores
- **Category Demand Analysis**: Break down demand by category and subcategory
- **Price Sensitivity Analysis**: Understand market price sensitivity for products

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **TanStack Query (React Query)**: Data fetching, caching, and synchronization
- **Recharts**: Beautiful and responsive charts
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React component library built on Radix UI

### AI & Backend Services
- **Google Gemini API**: AI-powered market analysis and recommendations
- **Environment Variables**: Secure API key management via `.env` file

### Development Tools
- **ESLint**: Code linting and quality checks
- **PostCSS**: CSS processing
- **SWC**: Fast TypeScript/JavaScript compiler

## Project Structure

```
jewel-wise-guide/
├── public/                 # Static assets
│   ├── favicon.ico        # Application favicon
│   ├── placeholder.svg    # Placeholder images
│   └── robots.txt         # SEO robots file
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ui/            # shadcn/ui components (buttons, cards, dialogs, etc.)
│   │   ├── AISuggestionCard.tsx    # AI recommendation cards
│   │   ├── Header.tsx              # Top navigation header
│   │   ├── InventoryCard.tsx       # Inventory category cards
│   │   ├── KPICard.tsx             # Key performance indicator cards
│   │   ├── Layout.tsx              # Main application layout
│   │   ├── LoadingProgress.tsx     # Loading indicators
│   │   ├── NavLink.tsx             # Navigation link component
│   │   └── Sidebar.tsx             # Side navigation sidebar
│   ├── hooks/             # Custom React hooks
│   │   ├── use-mobile.tsx # Mobile detection hook
│   │   └── use-toast.ts   # Toast notification hook
│   ├── lib/               # Utility libraries
│   │   └── utils.ts       # Helper functions (cn, etc.)
│   ├── pages/             # Page components (routes)
│   │   ├── Analytics.tsx  # Custom analytics builder page
│   │   ├── Dashboard.tsx  # Main dashboard with KPIs and AI insights
│   │   ├── Index.tsx      # Landing/index page
│   │   ├── Inventory.tsx  # Inventory management page
│   │   ├── Keywords.tsx   # Keyword research page
│   │   ├── Market.tsx     # Market overview page
│   │   └── NotFound.tsx   # 404 error page
│   ├── services/          # API and external service integrations
│   │   └── geminiService.ts  # Google Gemini API integration
│   ├── types/             # TypeScript type definitions
│   │   └── marketOverview.ts  # Market data type definitions
│   ├── App.tsx            # Root application component with routing
│   ├── App.css            # Global application styles
│   ├── index.css          # Base styles and CSS variables
│   └── main.tsx           # Application entry point
├── dist/                  # Production build output
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Infrastructure

### Application Architecture

The application follows a **single-page application (SPA)** architecture:

1. **Client-Side Routing**: React Router handles all navigation without page reloads
2. **Component-Based**: Modular React components for reusability
3. **State Management**: React Query for server state, React hooks for local state
4. **API Integration**: Direct client-side calls to Google Gemini API
5. **Build System**: Vite for fast development and optimized production builds

### Data Flow

1. **User Interaction** → React components trigger actions
2. **API Calls** → Services layer makes requests to Gemini API
3. **Data Caching** → React Query caches responses for performance
4. **UI Updates** → Components re-render with new data
5. **Error Handling** → User-friendly error messages and loading states

### Key Infrastructure Components

- **React Query**: Manages API calls, caching, and data synchronization
- **Environment Variables**: Secure API key storage (`.env` file)
- **TypeScript**: Type safety across the entire codebase
- **Vite Dev Server**: Hot module replacement for fast development
- **Production Build**: Optimized bundle with code splitting

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to install)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd jewel-wise-guide
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables** (optional)
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   Note: The app will work without the API key, but AI-powered features (Market Overview) will be disabled.

4. **Start the development server**
   ```sh
   npm run dev
   ```
   The application will be available at `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Code Files Overview

### Core Application Files

- **`src/main.tsx`**: Application entry point, renders the root component
- **`src/App.tsx`**: Main app component with routing configuration and providers
- **`index.html`**: HTML template with meta tags and root element

### Page Components (`src/pages/`)

- **`Dashboard.tsx`**: Main dashboard with KPIs, charts, and AI recommendations
- **`Inventory.tsx`**: Inventory management interface with category tracking
- **`Analytics.tsx`**: Custom analytics builder with modular components
- **`Market.tsx`**: Market overview with Gemini AI integration
- **`Keywords.tsx`**: Keyword research and trend analysis
- **`NotFound.tsx`**: 404 error page

### Service Layer (`src/services/`)

- **`geminiService.ts`**: 
  - `analyzeKeyword()`: Analyzes keyword trends and provides market intelligence
  - `analyzeMarketOverview()`: Generates comprehensive market overview
  - `isGeminiConfigured()`: Checks if API is properly configured

### Component Library (`src/components/`)

- **UI Components** (`ui/`): shadcn/ui components (buttons, cards, dialogs, etc.)
- **Business Components**: 
  - `KPICard.tsx`: Displays key performance indicators
  - `InventoryCard.tsx`: Shows inventory category details
  - `AISuggestionCard.tsx`: Displays AI recommendations
  - `Layout.tsx`: Main layout with sidebar and header
  - `Sidebar.tsx`: Navigation sidebar
  - `Header.tsx`: Top navigation header

### Configuration Files

- **`vite.config.ts`**: Vite build configuration, path aliases, plugins
- **`tsconfig.json`**: TypeScript compiler options
- **`tailwind.config.ts`**: Tailwind CSS theme and customization
- **`package.json`**: Dependencies and npm scripts

## Deployment

### Build for Production

```sh
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy Options

The application can be deployed to any static hosting service:

- **Vercel**: Connect your Git repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Deploy the `dist` folder to GitHub Pages
- **AWS S3 + CloudFront**: Upload to S3 and serve via CloudFront
- **Any static hosting**: The `dist` folder contains all static files needed

### Environment Variables in Production

Make sure to set `VITE_GEMINI_API_KEY` in your hosting platform's environment variables section.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
