import { createRouter, createWebHistory } from 'vue-router';
import InfoPage from '../components/InfoPage.vue';
import TreeInfo from '../components/TreeInfo.vue';
import TreeStatistics from '@/components/TreeStatistics.vue';
import FilterStatistics from '@/components/FilterStatistics.vue';
import TreeRecord from '@/components/TreeRecord.vue';

const routes = [

  {
    path:'/',
    name:'Home',
    redirect: '/trees/county_dublin' 
  },
  {
    path: '/trees',
    name:'InfoPage',
    component: InfoPage,
    children: [
      {
        path: '',
        name:'TreeStatistics',
        component: TreeStatistics,
        redirect:'/trees/county_dublin'
      },
      {
        path:':treeId',
        name:'TreeInfo',
        component: TreeInfo
      },
      {
        path: 'county_dublin/:id?',
        name: 'ElectoralStatistics',
        component: TreeStatistics,
      },
      {
        path: 'filter',
        name: 'FilterStatistics',
        component: FilterStatistics,
      },
      {
        path: ':treeId/records/new',
        name: 'NewTreeRecord',
        component: TreeRecord,
      },
      {
        path: ':treeId/records/:recordId/edit',
        name: 'EditTreeRecord',
        component: TreeRecord,
      }  
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

