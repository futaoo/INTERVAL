import { createRouter, createWebHistory } from 'vue-router';
import InfoPage from '../components/InfoPage.vue';
import TreeInfo from '../components/TreeInfo.vue';
import TreeStatistics from '@/components/TreeStatistics.vue';

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
        path:'county_dublin/:id?',
        name: 'ElectoralStatistics',
        component: TreeStatistics,
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

