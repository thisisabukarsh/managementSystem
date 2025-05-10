# BlackDiamond Project Management System

A modern project management system built with React, Tailwind CSS, and Supabase.

## Features

- 🔐 Authentication with Supabase
- 🌐 Bilingual support (Arabic/English)
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 📊 Project management
- 👥 Customer management
- 🛠️ Installation teams management
- 📦 Materials tracking
- 📋 Project sections checklist

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Supabase
- React Router
- i18next

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/blackdiamond.git
cd blackdiamond
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

## Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── services/           # API services
├── App.jsx            # Main App component
├── main.jsx           # Entry point
├── i18n.js            # Translations
└── index.css          # Global styles
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
