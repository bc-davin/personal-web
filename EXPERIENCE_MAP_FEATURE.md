# Experience Map & Timeline Feature

## Overview
This feature provides an interactive visualization of professional experience data with:
- **Global Map**: Display job locations with interactive markers
- **D3 Tree Visualization**: Hierarchical tree showing experiences at each location
- **Detailed Timeline**: Traditional timeline view with all details

## Features

### 1. Interactive Map
- Global map centered on all job locations
- Blue markers for each location
- Click markers to:
  - Pan and zoom to the location (smooth animation)
  - Display D3 tree visualization for that location

### 2. D3 Tree Visualization
- **BFS-style hierarchy**: Jobs sorted chronologically
- **Color-coded nodes**: By employment type
  - 🟢 Full-time: Green (#4CAF50)
  - 🔵 Part-time: Blue (#2196F3)
  - 🟠 Contract: Orange (#FF9800)
  - 🟣 Freelance: Purple (#9C27B0)
  - 🔷 Internship: Cyan (#00BCD4)
- **Interactive nodes**: 
  - Click to expand/collapse (future feature)
  - Hover to see tooltips with details
- **Animated transitions**: Smooth pan and zoom

### 3. Detailed Timeline
- Traditional timeline view below the map
- Shows all experience details:
  - Title, company, location
  - Employment type (color-coded badge)
  - Dates and duration
  - Description
  - Responsibilities
  - Technologies

## Technical Stack

### Dependencies
- **Leaflet**: Interactive map library
- **D3.js**: Tree visualization and data binding
- **Angular**: Component framework
- **TypeScript**: Type safety

### Files Modified
1. `experience.component.ts`: Main component logic
   - Map initialization
   - D3 tree rendering
   - Location grouping
   - Marker click handling

2. `experience.component.html`: Template
   - Map container
   - Tree visualization container
   - Legend
   - Timeline view

3. `experience.component.scss`: Styles
   - Responsive grid layout
   - Map and tree styling
   - Legend styling
   - Timeline styles

4. `styles.scss`: Global styles
   - Leaflet CSS import

### Data Requirements
The experience data must include:
- `lat` and `lon`: Geographic coordinates (required for map markers)
- `location`: Location name (string)
- `employment_type`: For color coding
- `start_date`: For chronological sorting
- All other fields from the Experience model

## Usage

### Adding Experience Data
Ensure your backend API returns experience data with `lat` and `lon` values:

```json
{
  "title": "Software Engineer",
  "company": "Tech Company",
  "location": "San Francisco, CA",
  "lat": 37.7749,
  "lon": -122.4194,
  ...
}
```

### Customization

#### Changing Map Tiles
Edit `experience.component.ts`, line ~89:
```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  // Change to different tile provider
})
```

#### Changing Color Scheme
Edit the `getNodeColor()` method in `experience.component.ts`:
```typescript
private getNodeColor(experience: Experience): string {
  const colorMap: { [key: string]: string } = {
    'Full-time': '#4CAF50',  // Change colors here
    ...
  };
}
```

#### Adjusting Tree Layout
Edit `renderTree()` method:
```typescript
const treeLayout = d3.tree<Experience>()
  .size([width - 100, height - 150])  // Adjust dimensions
  .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));  // Adjust spacing
```

## Responsive Design
The layout automatically adapts to different screen sizes:
- **Desktop (>1024px)**: Side-by-side map and tree
- **Tablet (768-1024px)**: Stacked layout
- **Mobile (<768px)**: Single column with reduced heights

## Performance Considerations
- Map markers are created once on initialization
- Tree visualization re-renders only when clicking markers
- Uses Angular signals for reactive updates
- Efficient D3 data binding with track functions

## Future Enhancements
1. Add collapsible tree nodes
2. Display multiple jobs per node (overlapping roles)
3. Add filters by employment type or technology
4. Export visualization as image
5. Add timeline scrubber to filter by date range
6. Clustering for locations with many experiences
7. Custom marker icons per employment type
