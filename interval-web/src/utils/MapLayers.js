import LayerGroup from 'ol/layer/Group';
import LayerTile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorTileSource from 'ol/source/VectorTile';
import VectorTileLayer from 'ol/layer/VectorTile';
import MVT from 'ol/format/MVT';



const osm = new LayerTile({
  title: 'Street',
  type: 'base',
  visible: true,
  source: new OSM({
    attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  })
});


const carto = new LayerTile({
  title: 'Light',
  type: 'base',
  visible: true,
  source: new XYZ({
    url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attributions: [
      '&copy; <a href="https://www.openstreetmap.org/copyright"></a> contributors',
      '&copy; <a href="https://carto.com/">CARTO</a>'],
  }),
});


  // Create a LayerGroup for base maps
export const baseMaps = new LayerGroup({
  title: 'Base maps',
  layers: [osm, carto]
});

