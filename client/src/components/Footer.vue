<template>
    <div class="border-t-2 border-primary-red global-container py-3 w-full font-subtitle lg:flex lg:justify-between lg:items-center">
        <p class="mb-2">© {{ date.getFullYear() }} Roquette Lab | All rights reserved. </p>
        <a href="https://roquette-lab.fr" class="underline" target="_blank">roquette-lab.fr</a>
    </div>
</template>

<script>

export default {
    name: "Footer",
    computed: {
        date() {
            return new Date()
        }
    }
}
</script>

<style scoped>

</style>