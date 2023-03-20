import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";

const routes = [
    { path: "/", name: "Home", component: Home },
    { path: "/login", name: "Login", component: () => import("@/views/Login.vue"), props: true },
    { path: "/game/:id", name: "Game", component: () => import("@/views/Game.vue") },
];

const scrollBehavior = (to, from, savedPosition) => {
    document.getElementById("app").scrollIntoView({ behavior: "smooth" });
};

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior,
});

export default router;
