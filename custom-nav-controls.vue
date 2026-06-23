<script setup lang="ts">
import { computed, ref } from 'vue'
import { recordCamera } from '@slidev/client/logic/recording.ts'
import { currentCamera, currentMic } from '@slidev/client/state/index.ts'

const displayAudioEnabled = ref(false)
const micEnabled = computed({
  get: () => currentMic.value !== 'none',
  set: enabled => currentMic.value = enabled ? 'default' : 'none',
})

function updateDisplayAudio() {
  window.localStorage.setItem('slidev-record-display-audio', displayAudioEnabled.value ? 'true' : 'false')
}

if (typeof window !== 'undefined') {
  if (currentMic.value === 'none')
    currentMic.value = 'default'
  if (currentCamera.value === 'none')
    currentCamera.value = 'default'
  recordCamera.value = true
  displayAudioEnabled.value = window.localStorage.getItem('slidev-record-display-audio') === 'true'
  updateDisplayAudio()
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="micEnabled"
    :title="micEnabled ? 'Microphone is on for recording' : 'Microphone is muted for recording'"
    class="recording-mic-toggle"
    @click="micEnabled = !micEnabled"
  >
    {{ micEnabled ? 'Mic on' : 'Mic off' }}
  </button>
  <button
    type="button"
    :aria-pressed="displayAudioEnabled"
    :title="displayAudioEnabled ? 'Shared tab or window audio is included' : 'Only microphone audio is recorded'"
    class="recording-audio-toggle"
    @click="displayAudioEnabled = !displayAudioEnabled; updateDisplayAudio()"
  >
    {{ displayAudioEnabled ? 'Tab audio on' : 'Mic only' }}
  </button>
</template>

<style scoped>
.recording-mic-toggle,
.recording-audio-toggle {
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 4px;
  color: currentColor;
  font-size: 11px;
  height: 24px;
  line-height: 1;
  margin: auto 2px;
  padding: 0 4px;
}

.recording-mic-toggle[aria-pressed='false'],
.recording-audio-toggle[aria-pressed='false'] {
  opacity: 0.58;
}
</style>
