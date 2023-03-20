import { createRouter, createWebHistory } from "vue-router";

import { useLogicStore } from "@/stores/logicStore";
import Users from "@/views/Users.vue";

async function isUserAuthenticated() {
    const logicStore = useLogicStore();

    if (!logicStore.key) {
        if (localStorage.getItem("gatheringKey")) {
            await logicStore.checkKey(localStorage.getItem("gatheringKey"))
        }
    }

    return logicStore.key ? true : "/login";
}

const routes = [
    {
        path: "/",
        redirect: "/users"
    },
    {
        path: "/users",
        name: "Users",
        component: Users,
        beforeEnter: isUserAuthenticated,
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/Login.vue"),
        props: true,
    },
    {
        path: "/answers",
        name: "Answers",
        component: () => import("@/views/Answers.vue"),
        beforeEnter: isUserAuthenticated,
    },
    {
        path: "/games",
        name: "Games",
        component: () => import("@/views/Games.vue"),
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
