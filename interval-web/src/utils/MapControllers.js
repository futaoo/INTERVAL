import {Zoom} from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';



// Initialize the LayerSwitcher control
export const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group',
  activationMode: 'click',
});


// Create a function that returns a customized Zoom control
export const createZoomControl = () => {
  // Create a new Zoom control
  const zoomControl = new Zoom();
  
  // Access the Zoom control's HTML element
  const zoomElement = zoomControl.element;

  // Set position styles dynamically
  zoomElement.style.position = 'absolute';
  zoomElement.style.right = '10px';  // Position from the right
  zoomElement.style.bottom = '30px'; // Position from the bottom
  zoomElement.style.left = 'auto';   // Override left position
  zoomElement.style.top = 'auto';    // Override top position

  return zoomControl;
};
