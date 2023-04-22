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
            name: "home",
            component: Home,
            beforeEnter: isUserAuthenticated
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/Login.vue"),
            beforeEnter: isUserUndefined
        },
    ],
});
