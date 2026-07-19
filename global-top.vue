<script setup lang="ts">
import { useDrawings, useNav } from "@slidev/client";
import { watch } from "vue";

const { currentSlideNo } = useNav();
const { drawingState } = useDrawings();

watch(currentSlideNo, (_currentSlide, previousSlide) => {
  if (previousSlide && drawingState[previousSlide]) {
    drawingState[previousSlide] = "";
  }
});
</script>

<template></template>
