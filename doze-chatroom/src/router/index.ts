import { createRouter, createWebHistory } from 'vue-router'
import store from "../store";
// 开启历史模式
// vue2中使用的mode：history 实现
const routes = [
    {
        path: '/home',
        name: 'home',
        component: () => import('../page/home.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../page/login.vue'),
    }
]
const router = createRouter(
    {
        history: createWebHistory(),
        routes
    }
)

router.beforeEach((to,form,next) => {
    if (to.path !== '/login' && store.state.uname === "") {
        next('/login');
        return;
    }
    next();
});

export default router;