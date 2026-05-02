<script setup lang="ts">
import ShowDetails from '../components/ShowDetails/ShowDetails.vue'

const props = defineProps<{ id: string }>()
</script>

<template>
  <ShowDetails :id="Number(props.id)" />
</template>
