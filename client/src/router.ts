/** @type {import('vite').UserConfig} */

import { createRouter, createWebHistory } from "vue-router";
import {useUserStore} from "@/stores/userStore";

import Home from "@/views/Home.vue";

function isUserAuthenticated(): boolean | string {
    const userStore = useUserStore();
    if (userStore.user?.id) {
        return true;
    } else {
        return "/login";
    }
}

function isUserUndefined(): boolean | string {
    const userStore = useUserStore();
    if (!userStore.user?.id) {
        return true;
    } else {
        return "/";
    }
}

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Home",
            component: Home,
            beforeEnter: isUserAuthenticated
        },
        {
            path: "/login",
            name: "Login",
            component: () => import("@/views/Login.vue"),
            beforeEnter: isUserUndefined
        },
    ],
});
