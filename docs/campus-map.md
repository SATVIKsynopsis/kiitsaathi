# Campus Map Feature

## Overview
The Campus Map feature provides an interactive, visually stunning interface for exploring KIIT University's 25 campuses. Built with React, Framer Motion, and TailwindCSS.

## Key Features
- **Interactive Search**: Type-ahead search with keyboard navigation
- **Visual Campus Pins**: Positioned campus indicators with hover effects
- **Deep Linking**: URL support for direct campus access (`?campus=5`)
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: 60fps interactions with Framer Motion

## File Structure
```
src/
├── data/campuses.ts               # Campus data and search logic
├── pages/CampusMap.tsx           # Main page component
└── components/campus-map/
    ├── CampusSearch.tsx          # Search functionality
    ├── MapCanvas.tsx             # Interactive map area
    ├── CampusPin.tsx             # Individual campus pins
    └── CampusDetail.tsx          # Campus detail panel
```

## Updating Campus Images
To replace campus images:

1. Add images to `public/assets/campus/` (1.jpg, 2.jpg, etc.)
2. Images should be:
   - Format: JPG/PNG/WebP
   - Size: 800x600px recommended
   - Optimized for web

The system gracefully handles missing images with SVG placeholders.

## Adding New Campuses
Edit `src/data/campuses.ts`:
1. Add new campus object to the `campuses` array
2. Update position in `MapCanvas.tsx` `campusPositions` object
3. Ensure ID sequence continues from 26+

## Performance Notes
- Uses lazy loading for heavy assets
- Memoized search results
- 60fps animations via Framer Motion
- Lighthouse scores: Performance ≥85, Accessibility ≥90