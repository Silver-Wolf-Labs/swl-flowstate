# SW Personal - Mood-Adaptive Productivity Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-FF0080?style=for-the-badge&logo=framer" alt="Framer Motion" />
</p>

<p align="center">
  A mood-adaptive productivity dashboard that helps developers and creators stay in flow while coding.
</p>

<p align="center">
  <strong>Built with 🐺 by Silver Wolf Labs</strong>
</p>

---

## ✨ Features

### 🎯 Mood Detection
Set your current vibe and watch the dashboard adapt. Choose from:
- **Deep Focus** - Minimize distractions, maximize output
- **Energetic** - High energy, fast-paced work
- **Creative** - Explore ideas, think outside the box
- **Calm** - Relaxed and steady progress

### ⏱️ Focus Timer
Pomodoro-style productivity sessions with:
- Customizable focus and break durations
- Visual progress ring with smooth animations
- Auto-switching between focus and break modes
- Session tracking and statistics

### 🎵 Vibe Zone
Curated music recommendations to match your flow:
- Quick access playlists
- Track suggestions based on mood
- Integrated playback controls
- Spotify integration ready

### 📊 Analytics Dashboard
Track your productivity trends:
- Daily focus time tracking
- Weekly performance charts
- Activity heatmap visualization
- AI-powered insights and recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sw-personal.git
cd sw-personal

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Lucide Icons** | Beautiful icon set |

## 🎨 Design Features

- **Dark Mode First** - Easy on the eyes during long coding sessions
- **Glass Morphism** - Modern, translucent UI elements
- **Gradient Accents** - Dynamic color highlights
- **Micro-Animations** - Delightful hover and transition effects
- **Responsive Design** - Works on all devices

## 📁 Project Structure

```
sw-personal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles & theme
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main dashboard page
│   ├── components/
│   │   ├── dashboard/          # Dashboard feature components
│   │   │   ├── analytics-preview.tsx
│   │   │   ├── features-section.tsx
│   │   │   ├── focus-timer.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── header.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── mood-selector.tsx
│   │   │   └── music-recommendations.tsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── animated-number.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── progress-ring.tsx
│   ├── hooks/                  # Custom React hooks
│   └── lib/
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
└── package.json
```

## 🔮 Roadmap

- [ ] User authentication
- [ ] Persistent data storage
- [ ] Spotify API integration
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] AI-powered mood detection

## 📄 License

MIT License - feel free to use this project for your own portfolio or learning purposes.

---

<p align="center">
  <strong>SW Personal</strong> · Mood-Adaptive Productivity · Silver Wolf Labs
</p>
