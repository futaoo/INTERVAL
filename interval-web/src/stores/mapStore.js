// stores/mapStore.js
import { defineStore } from 'pinia';

export const useMapStore = defineStore('mapStore', {
  state: () => ({
    mapInstance: null,
    styleCache: null,
    isInitialized: false,

  }),
  actions: {
    setMapInstance(map) {
      this.mapInstance = map;
    },
    getMapInstance() {
      return this.mapInstance;
    },
    setStyleCahe(styleCache){
      this.styleCache = styleCache;
    },
    getStyleCache(){
      return this.styleCache;
    },
    setMapInitializedTrue(){
      this.isInitialized = true;
    }
  },
});

