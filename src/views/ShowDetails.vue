<script setup lang="ts">
import ShowDetails from '../components/ShowDetails.vue'

const props = defineProps<{ id: string }>()
</script>

<template>
  <div class="about">
    <ShowDetails :id="Number(props.id)" />
  </div>
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
