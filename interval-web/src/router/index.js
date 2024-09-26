import { createRouter, createWebHistory } from 'vue-router';
import IntervalMap from '../components/IntervalMap.vue';
import InfoPage from '../components/InfoPage.vue';
import TreeInfo from '../components/TreeInfo.vue';
import IntervalContent from '@/components/IntervalContent.vue';
import TreeStatistics from '@/components/TreeStatistics.vue';

const routes = [

  {
    path:'/',
    name:'Home',
    redirect: '/trees' 
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
      },
      {
        path:':treeId',
        name:'TreeInfo',
        component: TreeInfo
      },
      {
        path:'electoral_dublin/:id',
        name: 'ElectoralStatistics',
        component: TreeStatistics
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

