<script setup lang="ts">
import { useDrawings, useNav } from "@slidev/client";
import { onBeforeUnmount, watch } from "vue";

const DISAPPEARING_INK_HOLD_MS = 3000;
const DISAPPEARING_INK_FADE_MS = 600;
const DISAPPEARING_INK_CLASS = "slidev-disappearing-ink";

const { currentSlideNo } = useNav();
const { clear, drauu, drawingState } = useDrawings();

let fadeTimer: ReturnType<typeof setTimeout> | undefined;
let clearTimer: ReturnType<typeof setTimeout> | undefined;

function cancelDisappearingInk() {
  if (fadeTimer) {
    clearTimeout(fadeTimer);
    fadeTimer = undefined;
  }

  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = undefined;
  }

  drauu.el?.classList.remove(DISAPPEARING_INK_CLASS);
}

function scheduleDisappearingInk() {
  cancelDisappearingInk();

  if (!drauu.el?.children.length) {
    return;
  }

  const slideNumber = currentSlideNo.value;

  fadeTimer = setTimeout(() => {
    if (currentSlideNo.value !== slideNumber || !drauu.el?.children.length) {
      return;
    }

    drauu.el.classList.add("slidev-disappearing-ink");
    clearTimer = setTimeout(() => {
      if (currentSlideNo.value === slideNumber) {
        clear();
      }
      drauu.el?.classList.remove(DISAPPEARING_INK_CLASS);
    }, DISAPPEARING_INK_FADE_MS);
  }, DISAPPEARING_INK_HOLD_MS);
}

const stopDrawingStart = drauu.on("start", cancelDisappearingInk);
const stopDrawingEnd = drauu.on("end", scheduleDisappearingInk);

watch(
  () => drawingState[currentSlideNo.value],
  (ink, previousInk) => {
    if (!ink) {
      cancelDisappearingInk();
    } else if (ink !== previousInk && !drauu.drawing) {
      scheduleDisappearingInk();
    }
  },
);

watch(currentSlideNo, (_currentSlide, previousSlide) => {
  cancelDisappearingInk();

  if (previousSlide && drawingState[previousSlide]) {
    drawingState[previousSlide] = "";
  }
});

onBeforeUnmount(() => {
  cancelDisappearingInk();
  stopDrawingStart();
  stopDrawingEnd();
});
</script>

<template></template>
