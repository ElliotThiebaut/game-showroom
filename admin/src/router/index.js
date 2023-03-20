import { createRouter, createWebHistory } from "vue-router";

import Users from "@/views/Users.vue";

const routes = [
    { path: "/", redirect: "/users" },
    { path: "/users", name: "Users", component: Users },
    { path: "/login", name: "Login", component: () => import("@/views/Login.vue"), props: true },
    { path: "/answers", name: "Answers", component: () => import("@/views/Answers.vue") },
    { path: "/games", name: "Games", component: () => import("@/views/Games.vue") },
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
