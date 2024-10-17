import { Fill, Stroke, Text, Style, Circle as CircleStyle, RegularShape } from 'ol/style';
import {asArray} from 'ol/color';
import { speciesColors } from '@/speciesColors';


const spreadRadiusMap = {
  'Up to 300 cm': 3,
  '301 - 600 cm': 6,
  '601 - 900 cm': 9,
  '901 - 1200 cm': 12,
  'More than 1200 cm': 15,
  'Unknown': 2, // Default radius for unknown spread category
};

// Function to generate styles dynamically and cache them
const getCachedStyle = (speciesId, spreadCategory, isPublic, styleCache) => {

  const radius = spreadRadiusMap[spreadCategory] || 2; // Fallback to 2 for unknown category
  const color = speciesColors[speciesId] || '#00FF00'; // Default color is green if not found

  const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`;
  if (!styleCache[cacheKey]) {
    const rgbaColor = asArray(color);
    rgbaColor[3] = 0.8; // Adjust color opacity

    const shapeStyle = isPublic
      ? new CircleStyle({
          radius: radius,
          fill: new Fill({ color: rgbaColor }),
          stroke: new Stroke({ color: rgbaColor, width: 1 }),
        })
      : new RegularShape({
          points: 3,
          radius: radius + 2, // Adjust size for private trees
          angle: 0,
          fill: new Fill({ color: rgbaColor }),
          stroke: new Stroke({ color: rgbaColor, width: 1 }),
        });

    styleCache[cacheKey] = new Style({
      image: shapeStyle,
    });
  }
  return styleCache[cacheKey];
};


// Function to return the highlighted style for the selected tree
const getHighlightedStyle = (speciesId, spreadCategory, isPublic, styleCache) => {
  // Use the pre-loaded style cache
  const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`
  var baseStyle = styleCache[cacheKey];

  baseStyle = baseStyle? baseStyle : unknowStyle;

  return new Style({
    image: isPublic  ? publicTreeStyle(baseStyle) : privateTreeStyle(baseStyle)
  });
}


// Fetch unique style combinations and initialize style cache
export const initializeStyleCache = async (styleCache) => {
  try {
    const response = await fetch('http://localhost:3001/api/styles');
    const styleData = await response.json();

    styleData.forEach(({ species_id, spread_category, is_public }) => {
      // Prepopulate the style cache for all combinations
      getCachedStyle(species_id, spread_category, is_public, styleCache);
    });

    console.log('Style cache initialized:', styleCache);
  } catch (error) {
    console.error('Error initializing style cache:', error);
  }
};



export const electoralStyle = (feature) => {
  // Define base styles for the polygon
  const baseStyle = new Style({
    stroke: new Stroke({
      color: 'black',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(0, 100, 0, 0.6)',
    }),
  });

  // Add text style for labels using the 'english' property
  const labelText = feature.get('english');
  if (labelText) {
    // If the `english` property exists, add a text label
    baseStyle.setText(
      new Text({
        font: 'bold 12px Calibri,sans-serif',
        text: labelText,         // Set the label text
        fill: new Fill({
          color: '#000',         // Text color
        }),
        stroke: new Stroke({
          color: '#fff',         // Add a white outline for readability
          width: 3,
        }),
        overflow: true,          // Allow text to overflow if feature is small
        placement: 'point',      // Place the text at the centroid of the feature
      })
    );
  }

  return baseStyle;
}

const unknowStyle = new Style({
  image: new CircleStyle({
    radius: 2, // Default radius if not found in cache
    fill: new Fill({ color: '#999' }),
    stroke: new Stroke({ color: '#000', width: 1 }),
  }),
});

export const treeStyle = (feature, styleCache) => {
  // Retrieve properties from the feature
  const speciesId = feature.get('species_id');
  const spreadCategory = feature.get('spread_category');
  const isPublic = feature.get('is_public');

  // Use the pre-loaded style cache
  const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`;

    // Call `getCachedStyle` to get the appropriate style, including exclusion check
  return styleCache[cacheKey] || unknowStyle
}

export const selectedTreeStyle = (feature, selectedTreeId, styleCache) => {

  const featureTreeId = feature.get('tree_id');
  const speciesId = feature.get('species_id');
  const spreadCategory = feature.get('spread_category');
  const isPublic = feature.get('is_public')

  // Use the pre-loaded style cache
  const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`
  
  // Check if the current feature is the selected one
  const isSelected = selectedTreeId === featureTreeId;

  // Return a different style if the feature is selected
  return isSelected ? getHighlightedStyle(speciesId, spreadCategory, isPublic, styleCache) : styleCache[cacheKey];

}

export const filteredTreeStyle = (feature, fitleredTreeIds, styleCache) => {

  const speciesId = feature.get('species_id');
  const spreadCategory = feature.get('spread_category');
  const treeId = feature.get('tree_id');
  const isPublic = feature.get('is_public');

  // Use the pre-loaded style cache
  const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`;

  if(fitleredTreeIds.includes(treeId)){
    // Call `getCachedStyle` to get the appropriate style, including exclusion check
    return styleCache[cacheKey] || unknowStyle
  }

}


const publicTreeStyle = (cachedStyle) => {

  const fillColor = cachedStyle.getImage().getFill().getColor();  // Keep the same fill color as the cached style

  return new CircleStyle({
    radius: cachedStyle.getImage().getRadius() + 2,  // Increase the size of the circle
    fill: new Fill({ color: fillColor }),  // Use the same fill color
    stroke: new Stroke({ color: '#654321', width: 5 })  // Add a red border for highlighting
  })
}

const  privateTreeStyle = (cachedStyle) => {

  const fillColor = cachedStyle.getImage().getFill().getColor();  // Keep the same fill color as the cached style

  return new RegularShape({
    points: 3,
    radius: cachedStyle.getImage().getRadius() + 2,  // Increase the size of the triangle
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({ color: '#654321', width: 5 }),  // Add a red border for highlighting
    angle: 0,
  })
}



