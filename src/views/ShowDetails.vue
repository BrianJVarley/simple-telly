<script setup lang="ts">
import ShowDetails from '../components/ShowDetails.vue'

const props = defineProps<{ id: string }>()
</script>

<template>
    <ShowDetails :id="Number(props.id)" />
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
