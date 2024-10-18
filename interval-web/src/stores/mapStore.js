// stores/mapStore.js
import { defineStore } from 'pinia';

export const useMapStore = defineStore('mapStore', {
  state: () => ({
    mapInstance: null,
    styleCache: null,
    selectedTreeId: null,
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
    setSelectedTreeId(treeId){
      this.selectedTreeId = treeId;
    },
    getSelectedTreeId(){
      return this.selectedTreeId
    }
  },
});
