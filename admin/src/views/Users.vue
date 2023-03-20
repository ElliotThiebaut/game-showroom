<template>
    <div v-if="!isLoading" class="mb-10">
        <HeaderCard>
            <div class="">
                <p>
                    Total number of users : <span class="font-bold text-lg lg:text-xl font-title">{{ usersStore.getNumberOfUsers }}</span>
                </p>
                <p>
                    Users connected at least once : <span class="font-bold text-lg lg:text-xl font-title">{{ usersStore.getNumberOfFirstVisitUser }}</span>
                </p>
                <p>
                    Users that viewed at <span class="underline font-bold">least one video</span> :
                    <span class="font-bold text-lg lg:text-xl font-title">{{ usersStore.getNumberOfOneVideoUser }}</span>
                </p>
                <p>
                    Users that viewed at least <span class="underline font-bold">half of all video</span> :
                    <span class="font-bold text-lg lg:text-xl font-title">{{ usersStore.getNumberOfHalfVideoUser }}</span>
                </p>
                <p>
                    Users that have viewed <span class="underline font-bold">all videos</span> : <span class="font-bold text-lg lg:text-xl font-title">{{ usersStore.getNumberOfAllVideoUser }}</span>
                </p>
            </div>
            <div
                @click="usersStore.exportUser"
                class="w-full text-center mt-10 lg:mt-0 lg:w-auto bg-white rounded font-subtitle text-lg text-primary-red py-2 lg:px-5 flex justify-center items-center cursor-pointer"
            >
                <p>Export</p>
            </div>
        </HeaderCard>

        <!--  User list  -->
        <v-grid class="h-[40vh]" readonly="true" autoSizeColumn="true" theme="material" filter="true" :source="usersStore.getTableUserData" :columns="columns" @beforeCellFocus="beforeFocus" />
    </div>

    <!-- Loading spinner -->
    <div v-if="isLoading" class="h-[50vh] flex flex-col justify-center">
        <ClipLoader :loading="true" :color="'#009A89'" :size="'50px'" />
    </div>
</template>

<script>
import { mapStores } from "pinia";
import { useUsersStore } from "@/stores/usersStore";
import ClipLoader from "vue-spinner/src/ClipLoader.vue";
import UserCard from "@/components/UserCard.vue";
import VGrid, { VGridVueTemplate } from "@revolist/vue3-datagrid";
import HeaderCard from "@/components/HeaderCard.vue";
import GridCheckbox from "@/components/GridCheckbox.vue";

export default {
    components: { ClipLoader, UserCard, VGrid, HeaderCard, GridCheckbox },

    data() {
        return {
            isLoading: false,
            currentlySelected: [],
            columns: [
                {
                    name: "Trash",
                    size: 50,
                    cellTemplate: VGridVueTemplate(GridCheckbox),
                },
                {
                    name: "Surname",
                    prop: "surname",
                    autoSize: true,
                    size: 120,
                },
                {
                    name: "Name",
                    prop: "name",
                    autoSize: true,
                    size: 120,
                },
                {
                    name: "Email",
                    prop: "email",
                    autoSize: true,
                    size: 270,
                },
                {
                    name: "Company",
                    prop: "company",
                    autoSize: true,
                    size: 160,
                },
                {
                    name: "Country",
                    prop: "country",
                    autoSize: true,
                    size: 150,
                },
                {
                    name: "Service",
                    prop: "service",
                    autoSize: true,
                    size: 150,
                },
                {
                    name: "Used the website ?",
                    prop: "firstVisit",
                    autoSize: true,
                    size: 200,
                },
            ],
        };
    },

    computed: {
        ...mapStores(useUsersStore),
    },

    methods: {
        beforeFocus(e) {
            e.preventDefault();
        },
    },
};
</script>

<style scoped></style>
