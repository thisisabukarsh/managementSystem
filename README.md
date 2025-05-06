# Project Management System

A modern project management system for construction and maintenance services, built with HTML, CSS, JavaScript, and Supabase.

## Features

- Project and maintenance service management
- Real-time data synchronization with Supabase
- Modern and responsive UI
- File upload support for quotations
- Search functionality
- Arabic language support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

You can find these credentials in your Supabase project settings under Project Settings > API.

4. Start the development server:

```bash
npm run dev
```

## Project Structure

```
├── src/
│   ├── assets/
│   │   └── logo.svg
│   │   └── main.js
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

The project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy your application.

Make sure to add your environment variables in the Vercel project settings.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
