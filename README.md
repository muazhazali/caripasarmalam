# 🏪 CariPasarMalam

> **Find and explore night markets across Malaysia**

A comprehensive web application to discover nearby pasar malam (night markets), browse markets on an interactive map or list, and view essential details to plan your visit. Built with modern web technologies and designed for both desktop and mobile users.

## ✨ Features

- 🗺️ **Interactive Map**: Precise market locations with Leaflet integration
- 📋 **List View**: Quick browsing of all markets with search and filters
- 🔍 **Smart Filters**: Filter by state, day of the week, and amenities
- 📱 **Responsive Design**: Mobile-first approach with modern UI components
- 🌍 **Multilingual**: Full support for English and Malay (Bahasa Malaysia)
- 📍 **Location Services**: Find nearest markets based on your location
- 🎨 **Modern UI**: Built with Shadcn UI, Radix UI, and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** (comes with Node.js) or **pnpm** (recommended)
- **Docker Desktop** (required for local Supabase development)
- **Supabase CLI** (installed via npx, no separate installation needed)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/caripasarmalam.git
   cd caripasarmalam
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using pnpm (recommended)
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   # Create .env.local file (see Local Development section below for details)
   ```

4. **Start local Supabase** (see [Local Development](#-local-development) section for details)
   ```bash
   npx supabase start
   ```

5. **Start the development server**
   ```bash
   # Using npm
   npm run dev
   
   # Or using pnpm
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build
# or
pnpm build

# Start the production server
npm start
# or
pnpm start
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL with JSONB)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Maps**: [Leaflet](https://leafletjs.com/)
- **Internationalization**: Custom i18n implementation
- **Icons**: [Lucide React](https://lucide.dev/)

## 📁 Project Structure

```
caripasarmalam/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contributors/      # Contributors page
│   ├── markets/           # Markets listing and detail pages
│   └── map/               # Map view page
├── components/            # React components
│   ├── ui/                # Reusable UI components (Shadcn)
│   └── *.tsx              # Feature-specific components
├── lib/                   # Utility functions and data
│   ├── markets-data.ts    # Market TypeScript types (deprecated functions)
│   ├── db.ts             # Database query functions (Supabase)
│   ├── db-transform.ts   # Database row transformation utilities
│   ├── supabase.ts       # Supabase server client
│   ├── supabase-client.ts # Supabase browser client
│   ├── geolocation.ts    # Coordinate to state mapping
│   ├── i18n.ts           # Internationalization
│   └── utils.ts          # General utilities
├── supabase/              # Supabase local development configuration
│   ├── config.toml       # Supabase local configuration
│   ├── migrations/       # Database migration files
│   │   └── 20251108115510_remote_schema.sql
│   ├── seed.sql          # Database seed data
│   └── tests/            # Database tests
├── dataset/               # Data processing scripts
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── scripts/               # Utility scripts
└── public/                # Static assets
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🆕 Adding New Markets

**Google Form (Recommended for non-developers)**
- Use our [Google Form](https://forms.gle/9sXDZYQknTszNSJfA) to submit new market information
- This is the easiest way for community members to contribute


### 🐛 Reporting Issues

- Use GitHub Issues to report bugs or request features
- Provide detailed information about the issue
- Include steps to reproduce if it's a bug

### 💻 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add TypeScript types where needed
   - Test your changes locally
4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

### 📝 Development Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Components**: Use functional components with TypeScript interfaces
- **Styling**: Use Tailwind CSS classes, prefer mobile-first approach
- **Internationalization**: All user-facing text should support both English and Malay
- **Performance**: Minimize client-side JavaScript, prefer React Server Components

### 🧪 Testing Your Changes

```bash
# Run the development server
npm run dev
# or
pnpm dev

# Check for linting issues
npm run lint
# or
pnpm lint

# Build to check for TypeScript errors
npm run build
# or
pnpm build
```

## 🌍 Internationalization

The application supports both English and Malay languages. When contributing:

- All user-facing text should be added to the translation files in `lib/i18n.ts`
- Use the `useTranslations()` hook in components
- Test both language versions of your changes

## 📊 Data Structure

Markets are stored in the `pasar_malams` table in Supabase with the following schema:

### Database Table: `pasar_malams`

```sql
CREATE TABLE "public"."pasar_malams" (
    "id" character varying(128) NOT NULL PRIMARY KEY,
    "name" character varying(256) NOT NULL,
    "address" character varying(512) NOT NULL,
    "district" character varying(128) NOT NULL,
    "state" character varying(64) NOT NULL,
    "status" character varying(32) DEFAULT 'Active' NOT NULL,
    "description" text,
    "area_m2" numeric(12,2),
    "total_shop" integer,
    "parking_available" boolean DEFAULT false NOT NULL,
    "parking_accessible" boolean DEFAULT false NOT NULL,
    "parking_notes" text,
    "amen_toilet" boolean DEFAULT false NOT NULL,
    "amen_prayer_room" boolean DEFAULT false NOT NULL,
    "location" jsonb,                    -- Contains: { "lat": number, "lng": number, "gmaps_link": text }
    "schedule" jsonb DEFAULT '[]' NOT NULL,  -- Array of schedule objects
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "shop_list" text -- eg: apam balik, kebab, burger, kuih, nasi berlauk, dll
);
```

### Schedule JSONB Structure

The `schedule` field is a JSONB array with the following structure:

```typescript
type Schedule = Array<{
  day: string;        // e.g., "Monday", "Tuesday", etc.
  start_time?: string; // e.g., "17:00"
  end_time?: string;   // e.g., "22:00"
  notes?: string;     // Optional notes about the schedule
}>
```

### Location JSONB Structure

The `location` field contains geographic coordinates:

```typescript
type Location = {
  lat: number;  // Latitude
  lng: number;  // Longitude
}
```

### Status Values

The `status` field accepts one of the following values:
- `'Active'` (default)
- `'Inactive'`
- `'Suspended'`
- `'Closed'`

### Indexes

The table includes several indexes for performance:
- `idx_pasar_malams_state` - Index on state column
- `idx_pasar_malams_state_active` - Partial index on state where status = 'Active'
- `idx_pasar_malams_state_district` - Composite index on state and district
- `idx_pasar_malams_status` - Partial index on status where status = 'Active'
- `idx_pasar_malams_parking` - Index on parking fields
- `idx_pasar_malams_amenities` - Index on amenity fields
- `idx_pasar_malams_schedule_gin` - GIN index on schedule JSONB for efficient querying

## 💻 Local Development

This guide will help you set up the project for local development using Supabase CLI and Docker.

### Prerequisites

- **Docker Desktop** must be installed and running
- **Node.js** 18.0 or higher
- **pnpm** (recommended) or npm

### Step 1: Install Dependencies

```bash
pnpm install
# or
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration for Local Development
# These values will be provided after running 'npx supabase start'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key_here

# Optional Configuration
NEXT_PUBLIC_SUGGEST_MARKET_URL=https://forms.gle/9sXDZYQknTszNSJfA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note**: After running `npx supabase start`, copy the API keys from the output and paste them into your `.env.local` file.

### Step 3: Start Local Supabase

The project uses Supabase CLI for local development. Supabase CLI runs all services (PostgreSQL, API, Auth, Storage, etc.) in Docker containers.

```bash
# Start all Supabase services locally
npx supabase start
```

This command will:
- Start Docker containers for all Supabase services
- Apply database migrations from `supabase/migrations/`
- Run seed data from `supabase/seed.sql` (if enabled)
- Display connection details including API keys

**Expected output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copy the API keys** from the output and update your `.env.local` file:
- `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Access Supabase Studio

After starting Supabase, you can access the local Supabase Studio dashboard at:
- **Studio URL**: http://127.0.0.1:54323

This provides a web interface to:
- View and manage your database tables
- Run SQL queries
- Test authentication
- Manage storage buckets
- View API documentation

### Step 5: Start Next.js Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Common Supabase CLI Commands

For a complete reference, see the [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction).

#### Initialization and Setup

```bash
# Initialize Supabase in your project (already done in this repo)
npx supabase init

# Start local Supabase services
npx supabase start

# Stop all local Supabase services
npx supabase stop

# Check status of local services
npx supabase status
```

#### Database Management

```bash
# Pull remote database schema to local
npx supabase db pull

# Push local migrations to remote database
npx supabase db push

# Reset local database (applies all migrations and seed data)
npx supabase db reset

# Create a new migration file
npx supabase migration new migration_name

# Generate TypeScript types from local database
npx supabase gen types typescript --local > types/database.types.ts
```

#### Linking to Remote Project

```bash
# Login to Supabase (if using remote project)
npx supabase login

# Link local project to remote Supabase project
npx supabase link --project-ref your-project-ref

# Pull schema from linked remote project
npx supabase db pull --linked
```

### Troubleshooting

#### Docker Issues

If `npx supabase start` fails:
1. Ensure Docker Desktop is running
2. Check if ports 54321-54327 are available
3. Try stopping and restarting Docker Desktop

#### Port Conflicts

If you encounter port conflicts:
- Supabase API: 54321
- Database: 54322
- Studio: 54323
- Inbucket (Email): 54324

You can modify these in `supabase/config.toml` if needed.

#### Database Reset

If you need to reset your local database:

```bash
npx supabase db reset
```

This will:
- Drop all tables
- Re-apply all migrations
- Re-run seed data

#### View Logs

```bash
# View Supabase service logs
npx supabase status
```

### Development Workflow

1. **Make database changes**: Create a new migration file
   ```bash
   npx supabase migration new add_new_column
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Apply the migration**:
   ```bash
   npx supabase db reset  # Resets and applies all migrations
   ```

4. **Generate TypeScript types** (if schema changed):
   ```bash
   npx supabase gen types typescript --local > types/database.types.ts
   ```

5. **Test your changes** in the Next.js app

## 🚀 Deployment

The application is designed to be deployed on platforms like Vercel, Netlify, or any Node.js hosting service.

### Environment Variables for Production

For production deployment, create a `.env.production` file or set environment variables in your hosting platform:

```env
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Optional
NEXT_PUBLIC_SUGGEST_MARKET_URL=https://forms.gle/9sXDZYQknTszNSJfA
NEXT_PUBLIC_SITE_URL=https://pasarmalam.app
```

### Remote Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)
3. **Push local migrations to remote**:
   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```
4. **Seed production data** (if needed):
   ```bash
   # Use Supabase SQL Editor or run seed script
   ```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Thanks to all contributors who help maintain the market data
- Built with amazing open-source tools and libraries
- Inspired by CariTaman, CariSTPM, CariSurau, Sedekah.je

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/caripasarmalam/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/caripasarmalam/discussions)

---

**Made with 🤍 for the Malaysian community**



