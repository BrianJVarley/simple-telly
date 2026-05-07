<script setup lang="ts">
import ShowDetails from '../components/ShowDetails/ShowDetails.vue'

const props = defineProps<{ id: number }>()
</script>

<template>
  <ShowDetails :id="props.id" />
</template>
