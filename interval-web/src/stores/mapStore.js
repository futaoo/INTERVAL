// stores/mapStore.js
import { defineStore } from 'pinia';

export const useMapStore = defineStore('mapStore', {
  state: () => ({
    mapInstance: null,
  }),
  actions: {
    setMapInstance(map) {
      this.mapInstance = map;
    },
    getMapInstance() {
      return this.mapInstance;
    }
  },
});
