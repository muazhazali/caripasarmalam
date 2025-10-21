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

3. **Start the development server**
   ```bash
   # Using npm
   npm run dev
   
   # Or using pnpm
   pnpm dev
   ```

4. **Open your browser**
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
│   ├── markets-data.ts    # Market data and utilities
│   ├── i18n.ts           # Internationalization
│   └── utils.ts          # General utilities
├── dataset/               # Data processing scripts
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🆕 Adding New Markets

**Option 1: Google Form (Recommended for non-developers)**
- Use our [Google Form](https://forms.gle/9sXDZYQknTszNSJfA) to submit new market information
- This is the easiest way for community members to contribute

**Option 2: Direct Code Contribution**
1. Fork the repository
2. Add market data to `lib/markets-data.ts`
3. Follow the existing data structure
4. Submit a pull request

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

Markets are stored in `lib/markets-data.ts` with the following structure:

```typescript
interface Market {
  id: string
  name: string
  name_malay: string
  state: string
  city: string
  address: string
  coordinates: [number, number] // [latitude, longitude]
  operating_days: string[]
  operating_hours: string
  stall_count: number
  area_size: string
  amenities: {
    parking: boolean
    toilet: boolean
    prayer_room: boolean
    accessible_parking: boolean
  }
  description: string
  description_malay: string
}
```

## 🚀 Deployment

The application is designed to be deployed on platforms like Netlify, or any Node.js hosting service.

### Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SUGGEST_MARKET_URL=https://forms.gle/9sXDZYQknTszNSJfA
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



