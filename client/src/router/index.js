import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import { useUserStore } from "@/stores/userStore";

async function isUserAuthenticated() {
    const userStore = useUserStore();

    if (!userStore.id) {
        if (localStorage.getItem("userId")) {
            await userStore.getUser("", localStorage.getItem("userId"))
        }
    }

    return userStore.id ? true : "/login";
}

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
        beforeEnter: isUserAuthenticated,
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/Login.vue"), props: true
    },
    {
        path: "/game/:id",
        name: "Game",
        component: () => import("@/views/Game.vue"),
        beforeEnter: isUserAuthenticated,
    },
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
