import { createRouter, createWebHistory } from 'vue-router'
import AccountBook from '../components/AccountBook/AccountBook.vue'
import SavingsGoals from '../components/SavingsGoals/SavingsGoals.vue'

const routes = [
  {
    path: '/',
    name: 'AccountBook',
    component: AccountBook
  },
  {
    path: '/savings-goals',
    name: 'SavingsGoals',
    component: SavingsGoals
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
