// stores/recordStore.js
import { defineStore } from 'pinia';

export const useRouteParamsStore = defineStore('routeParamsStore', {
  state: () => ({
    treeId: null,
    geomWKT: null,
  }),
  actions: {
    setTreeId(treeId) {
      this.treeId= treeId;
    },
    getTreeId() {
      return this.treeId;
    },
    setGeomWKT(geomWKT) {
      this.geomWKT= geomWKT;
    },
    getGeomWKT() {
      return this.geomWKT;
    }
  },
});
