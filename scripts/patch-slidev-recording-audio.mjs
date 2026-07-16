import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const recordingPath = resolve(root, 'node_modules/@slidev/client/logic/recording.ts')

if (!existsSync(recordingPath)) {
  throw new Error('Slidev recording source not found. Run npm install before building slides.')
}

let source = readFileSync(recordingPath, 'utf8')
let changed = false

function replaceFirst(label, candidates, replacement) {
  if (source.includes(replacement))
    return

  const found = candidates.find(candidate => source.includes(candidate))
  if (!found)
    throw new Error(`Could not apply Slidev recording audio patch: missing ${label}.`)

  source = source.replace(found, replacement)
  changed = true
}

const stateOriginal = `  let recordingStartTime = 0\n`
const stateWithMixer = `  let recordingStartTime = 0\n  let recordingAudioContext: AudioContext | undefined\n  let recordingAudioSources: MediaStreamAudioSourceNode[] = []\n`
const stateWithMixerResume = `  let recordingStartTime = 0\n  let recordingAudioContext: AudioContext | undefined\n  let recordingAudioSources: MediaStreamAudioSourceNode[] = []\n  let resumeRecordingAudioContext: (() => void) | undefined\n`

replaceFirst('recording audio state', [stateWithMixer, stateOriginal], stateWithMixerResume)

const displayMediaOriginal = `    streamCapture.value = await navigator.mediaDevices.getDisplayMedia({\n      video: {\n        // aspectRatio: 1.6,\n        frameRate: frameRate.value,\n        width,\n        height,\n        // @ts-expect-error missing types\n        cursor: 'motion',\n        resizeMode: 'crop-and-scale',\n      },\n      selfBrowserSurface: 'include',\n    })\n`
const displayMediaAlwaysAudio = `    streamCapture.value = await navigator.mediaDevices.getDisplayMedia({\n      video: {\n        // aspectRatio: 1.6,\n        frameRate: frameRate.value,\n        width,\n        height,\n        // @ts-expect-error missing types\n        cursor: 'motion',\n        resizeMode: 'crop-and-scale',\n      },\n      audio: {\n        echoCancellation: false,\n        noiseSuppression: false,\n        suppressLocalAudioPlayback: false,\n      },\n      selfBrowserSurface: 'include',\n      surfaceSwitching: 'include',\n      // @ts-expect-error newer Screen Capture hints are not typed in all TS versions.\n      systemAudio: 'include',\n      // @ts-expect-error newer Screen Capture hints are not typed in all TS versions.\n      windowAudio: 'system',\n    })\n`
const displayMediaPatched = `    const includeDisplayAudio = window.localStorage.getItem('slidev-record-display-audio') === 'true'\n    streamCapture.value = await navigator.mediaDevices.getDisplayMedia({\n      video: {\n        // aspectRatio: 1.6,\n        displaySurface: 'window',\n        frameRate: frameRate.value,\n        width,\n        height,\n        // @ts-expect-error missing types\n        cursor: 'motion',\n        resizeMode: 'crop-and-scale',\n      },\n      audio: includeDisplayAudio\n        ? {\n            echoCancellation: false,\n            noiseSuppression: false,\n            suppressLocalAudioPlayback: false,\n          }\n        : false,\n      monitorTypeSurfaces: 'exclude',\n      selfBrowserSurface: 'include',\n      surfaceSwitching: 'include',\n      // @ts-expect-error newer Screen Capture hints are not typed in all TS versions.\n      systemAudio: includeDisplayAudio ? 'include' : 'exclude',\n      // @ts-expect-error newer Screen Capture hints are not typed in all TS versions.\n      windowAudio: includeDisplayAudio ? 'system' : 'exclude',\n    })\n`

const displayMediaCurrentPatched = `    const includeDisplayAudio = window.localStorage.getItem('slidev-record-display-audio') === 'true'\n    streamCapture.value = await navigator.mediaDevices.getDisplayMedia({\n      video: {\n        // aspectRatio: 1.6,\n        frameRate: frameRate.value,\n        width,\n        height,\n        // @ts-expect-error missing types\n        cursor: 'motion',\n        resizeMode: 'crop-and-scale',\n      },\n      audio: includeDisplayAudio\n        ? {\n            echoCancellation: false,\n            noiseSuppression: false,\n            suppressLocalAudioPlayback: false,\n          }\n        : false,\n      selfBrowserSurface: 'include',\n      surfaceSwitching: 'include',\n      // @ts-expect-error newer Screen Capture hints are not typed in all TS versions.\n      systemAudio: includeDisplayAudio ? 'include' : 'exclude',\n      // @ts-expect-error newer Screen Capture hints are not typed in all TS versions.\n      windowAudio: includeDisplayAudio ? 'system' : 'exclude',\n    })\n`

replaceFirst('display media audio constraints', [displayMediaCurrentPatched, displayMediaPatched, displayMediaAlwaysAudio, displayMediaOriginal], displayMediaPatched)

const mergeOriginal = `    if (streamCamera.value) {\n      const audioTrack = streamCamera.value!.getAudioTracks()?.[0]\n      if (audioTrack)\n        streamSlides.value!.addTrack(audioTrack)\n\n      recorderCamera.value = new Recorder(\n`
const mergeV1 = `    const audioTracks = [\n      ...streamCapture.value!.getAudioTracks(),\n      ...(streamCamera.value?.getAudioTracks() || []),\n    ]\n    if (audioTracks.length === 1) {\n      streamSlides.value!.addTrack(audioTracks[0])\n    }\n    else if (audioTracks.length > 1) {\n      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext\n      if (AudioContextCtor) {\n        recordingAudioContext = new AudioContextCtor()\n        const destination = recordingAudioContext.createMediaStreamDestination()\n        recordingAudioSources = audioTracks.map((track) => {\n          const source = recordingAudioContext!.createMediaStreamSource(new MediaStream([track]))\n          source.connect(destination)\n          return source\n        })\n        destination.stream.getAudioTracks().forEach(track => streamSlides.value!.addTrack(track))\n      }\n      else {\n        audioTracks.forEach(track => streamSlides.value!.addTrack(track))\n      }\n    }\n\n    if (streamCamera.value) {\n      recorderCamera.value = new Recorder(\n`
const mergeV2 = `    const audioTracks = [\n      ...streamCapture.value!.getAudioTracks(),\n      ...(streamCamera.value?.getAudioTracks() || []),\n    ]\n    if (audioTracks.length === 1) {\n      streamSlides.value!.addTrack(audioTracks[0])\n    }\n    else if (audioTracks.length > 1) {\n      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext\n      if (AudioContextCtor) {\n        recordingAudioContext = new AudioContextCtor()\n        const destination = recordingAudioContext.createMediaStreamDestination()\n        recordingAudioSources = audioTracks.map((track) => {\n          const source = recordingAudioContext!.createMediaStreamSource(new MediaStream([track]))\n          source.connect(destination)\n          return source\n        })\n        destination.stream.getAudioTracks().forEach(track => streamSlides.value!.addTrack(track))\n        resumeRecordingAudioContext = () => {\n          if (recordingAudioContext?.state === 'suspended')\n            void recordingAudioContext.resume()\n        }\n        resumeRecordingAudioContext()\n        document.addEventListener('visibilitychange', resumeRecordingAudioContext)\n      }\n      else {\n        audioTracks.forEach(track => streamSlides.value!.addTrack(track))\n      }\n    }\n\n    if (streamCamera.value) {\n      recorderCamera.value = new Recorder(\n`

replaceFirst('screen audio merge', [mergeV1, mergeOriginal], mergeV2)

const cleanupOriginal = `      closeStream(streamCapture)\n      closeStream(streamSlides)\n      recorderSlides.value = undefined\n`
const cleanupV1 = `      closeStream(streamCapture)\n      closeStream(streamSlides)\n      recordingAudioSources = []\n      void recordingAudioContext?.close()\n      recordingAudioContext = undefined\n      recorderSlides.value = undefined\n`
const cleanupV2 = `      closeStream(streamCapture)\n      closeStream(streamSlides)\n      recordingAudioSources.forEach(source => source.disconnect())\n      recordingAudioSources = []\n      void recordingAudioContext?.close()\n      recordingAudioContext = undefined\n      recorderSlides.value = undefined\n`
const cleanupV3 = `      closeStream(streamCapture)\n      closeStream(streamSlides)\n      if (resumeRecordingAudioContext)\n        document.removeEventListener('visibilitychange', resumeRecordingAudioContext)\n      resumeRecordingAudioContext = undefined\n      recordingAudioSources.forEach(source => source.disconnect())\n      recordingAudioSources = []\n      void recordingAudioContext?.close()\n      recordingAudioContext = undefined\n      recorderSlides.value = undefined\n`

replaceFirst('screen audio cleanup', [cleanupV2, cleanupV1, cleanupOriginal], cleanupV3)

if (changed) {
  writeFileSync(recordingPath, source)
  console.log('Patched Slidev recording to include shared tab/window audio and keep the audio mixer resumed.')
}
else {
  console.log('Slidev recording audio patch already applied.')
}
