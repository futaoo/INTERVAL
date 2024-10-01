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
