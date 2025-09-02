import { createRouter, createWebHistory } from 'vue-router'
import AccountBook from '../components/AccountBook/AccountBook.vue'
import SavingsGoals from '../components/SavingsGoals/SavingsGoals.vue'
import AIChat from '../components/AIChat/AIChat.vue'

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
  },
  {
    path: '/ai-chat',
    name: 'AIChat',
    component: AIChat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
