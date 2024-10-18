// stores/recordStore.js
import { defineStore } from 'pinia';

export const useTreeRecordStore = defineStore('treeRecordStore', {
  state: () => ({
    currentRecord: null,
  }),
  actions: {
    setRecord(record) {
      this.currentRecord = record;
    },
    getRecord() {
      return this.currentRecord;
    },
    clearRecord() {
      this.currentRecord = null;
    },
  },
});
