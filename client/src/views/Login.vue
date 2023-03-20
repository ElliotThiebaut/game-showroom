<template>
    <div v-if="formRegister" class="h-[80vh] flex flex-col justify-center lg:w-2/3 xl:w-1/2 3xl:w-1/3 mx-auto">
        <div class="p-5 flex flex-col w-full">
            <form @submit.prevent="loginRegister" class="flex flex-col">
                <label class="font-subtitle">Email</label>
                <input type="email" placeholder="mail@company.com" v-model="formRegisterValues.formRegisterEmail" class="border-b-primary-red border-b-2 mb-3 p-1" />

                <label class="font-subtitle mt-2">Name</label>
                <input type="text" placeholder="Your name..." v-model="formRegisterValues.formRegisterName" class="border-b-primary-red border-b-2 mb-3 p-1" />

                <label class="font-subtitle mt-2">Surname</label>
                <input type="text" placeholder="Your surname..." v-model="formRegisterValues.formRegisterSurname" class="border-b-primary-red border-b-2 mb-3 p-1" />

                <label class="font-subtitle mt-2">Company</label>
                <input type="text" placeholder="Enterprise Inc." v-model="formRegisterValues.formRegisterCompany" class="border-b-primary-red border-b-2 mb-3 p-1" />

                <label class="font-subtitle mt-2">Service</label>
                <input type="text" placeholder="Your service..." v-model="formRegisterValues.formRegisterService" class="border-b-primary-red border-b-2 mb-3 p-1" />

                <label class="font-subtitle mt-2">Country</label>
                <input type="text" placeholder="France" v-model="formRegisterValues.formRegisterCountry" class="border-b-primary-red border-b-2 mb-3 p-1" />

                <input type="submit" value="Submit" class="bg-primary-red p-2 font-title text-white cursor-pointer mt-3" />
            </form>

            <p class="bg-yellow-400/70 font-subtitle text-center rounded-lg mt-5 p-3" v-if="formRegisterError">{{ formRegisterError }}</p>
        </div>
    </div>
    <div v-else class="h-[80vh] flex flex-col justify-center lg:w-2/3 xl:w-1/2 3xl:w-1/3 mx-auto">
        <div class="p-5 flex flex-col w-full">
            <form @submit.prevent="loginSubmit" class="flex flex-col">
                <label for="email" class="font-subtitle text-xl mb-3">Email</label>
                <input type="email" placeholder="mail@company.com" id="email" v-model="formEmail" class="border-b-primary-red border-b-2 mb-3 p-1" />
                <input type="submit" value="Log In" class="bg-primary-red p-2 font-title text-white cursor-pointer" />
            </form>

            <button @click="formRegister = true" class="border-2 border-primary-red p-2 font-title cursor-pointer mt-3 text-primary-red">Register</button>
            <p class="bg-green-700/70 font-subtitle text-white text-center rounded-lg mt-5 p-3" v-if="registerCompleteMessage">{{ registerCompleteMessage }}</p>
            <p class="bg-yellow-400/70 font-subtitle text-center rounded-lg mt-5 p-3" v-if="formError">{{ formError }}</p>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUserStore } from "@/stores/userStore";

export default {
    props: ["errorPassed"],

    data() {
        return {
            formEmail: "",
            formRegisterValues: {
                formRegisterEmail: "",
                formRegisterSurname: "",
                formRegisterName: "",
                formRegisterCompany: "",
                formRegisterCountry: "",
                formRegisterService: "",
            },
            formError: this.errorPassed,
            formRegisterError: "",
            registerCompleteMessage: "",
            formRegister: false,
        };
    },

    computed: {
        ...mapState(useUserStore, ["id"]),
    },

    methods: {
        ...mapActions(useUserStore, ["getUser", "registerUser"]),

        loginSubmit() {
            this.getUser(this.formEmail, "")
                .then(() => {
                    this.formEmail = "";
                    this.formError = "";
                    this.$router.push({ name: `Home` });
                })
                .catch(err => {
                    this.formEmail = "";
                    if (err.message === "404") {
                        this.formError = "We didn't find this email";
                    } else {
                        this.formError = "Server Error, please try again later";
                    }
                });
        },

        loginRegister() {
            this.registerUser(this.formRegisterValues)
                .then(() => {
                    this.formRegisterValues = {
                        formRegisterEmail: "",
                        formRegisterSurname: "",
                        formRegisterName: "",
                        formRegisterCompany: "",
                        formRegisterCountry: "",
                        formRegisterService: "",
                    };
                    this.formRegisterError = "";
                    this.formRegister = false;
                    this.registerCompleteMessage = "Thanks for registering, you can now login";
                })
                .catch(err => {
                    this.formError = "Something went wrong, please try again";
                });
        },
    },

    created() {
        if (this.id) {
            this.$router.push({ name: `Home` });
        }
    },
};
</script>

<style scoped></style>
