// stores/treeStore.js
import { defineStore } from 'pinia';

export const useTreeStore = defineStore('tree', {
  state: () => ({
    fromFilter: false,
    inclTreeIds:[],
    electoralName: '',
    treeStatistics: {
      totalTrees: 0,
      totalSpecies: 0,
      totalIssues: 0,
      mostCommonSpecies: "",
      publicPercentage: 0,
      privatePercentage: 0,
      nativePercentage: 0,
      nonNativePercentage: 0,
      ecologicalBenefits: [],
      speciesComposition: [],
      activities: []
    }
  }),
  actions: {
    setFromFilterTrue(){
      this.fromFilter = true;
    },
    setExclTreeIds(ids) {
      this.inclTreeIds = ids;
    },
    setElectoralName(name) {
      this.electoralName = name;
    },
    setTreeStatistics(data) {
      this.treeStatistics = {
        ...this.treeStatistics,
        ...data
      };
    },
    async fetchStatistics(query) {
      try {
        const response = await fetch(`http://localhost:3001/api/trees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(query)
        });


        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Filters applied successfully:', data);

        
        // Update the state with fetched data
        this.setElectoralName(data.electoralName);
        this.setExclTreeIds(data.treeIds)
        
        // Sort activities by date (most recent first), format the date to 'yyyy-mm-dd', and select the top 10
        const sortedActivities = data.activities
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)
          .map(activity => ({
            ...activity,
            date: new Date(activity.date).toISOString().slice(0, 10) // Format to 'yyyy-mm-dd'
          }));

        this.setTreeStatistics({
          totalTrees: data.totalTrees,
          totalSpecies: data.totalSpecies,
          totalIssues: sortedActivities.length,
          mostCommonSpecies: data.mostCommonSpecies,
          publicPercentage: data.publicPercentage,
          privatePercentage: data.privatePercentage,
          nativePercentage: data.nativePercentage,
          nonNativePercentage: data.nonNativePercentage,
          ecologicalBenefits: data.ecologicalBenefits,
          speciesComposition: data.speciesComposition,
          activities: sortedActivities
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } 
    }
  }
});


export const useTreeInfoStore = defineStore ('treeInfo', {
  state: () => ({
    tree: null,
    totalMonetaryValue: 0,
  }),
  actions: {
    setTree(tree){
      this.tree = tree;
    },
    getTree(){
      return this.tree;
    },
    setTotalMonetaryValue (value){
      this.totalMonetaryValue = value
    },
    getTotalMonetaryValue (){
      return this.totalMonetaryValue;
    },
    async fetchTreeData (treeId) {
      try {
        const response = await fetch(`http://localhost:3001/api/trees/${treeId}`);
        const treeData = await response.json();

        // Computed property to sort the ecological benefits by name
        const sortedEcologicalBenefits = treeData.ecologicalBenefits.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });

        treeData.ecologicalBenefits = sortedEcologicalBenefits;

        const totalMonetaryValue = treeData.ecologicalBenefits.reduce((sum, benefit) => {
            const monetaryValue = parseFloat(benefit.monetary) || 0; // Ensure it's a number or default to 0
            return sum + monetaryValue;
          }, 0).toFixed(2);

        this.setTotalMonetaryValue(totalMonetaryValue);
    
        // Sort activities by date (most recent first), format the date to 'yyyy-mm-dd', and select the top 10
        const sortedInspections = treeData.inspections
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10)
          .map(activity => ({
            ...activity,
            date: new Date(activity.date).toISOString().slice(0, 10) // Format to 'yyyy-mm-dd'
        }));
    
        treeData.inspections = sortedInspections;
    
        this.setTree(treeData); // Set the fetched data to the tree ref
      } catch (error) {
        console.error('Error fetching tree data:', error);
      }
    }
  }

});
