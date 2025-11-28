class _GameAudio {
  musicVolume = 1
  effectsVolume = 1
  audioTracks: { [key: string]: string } = {}
  musicPlaying?: HTMLAudioElement
  audioTracksFailed: { [key: string]: boolean } = {}

  preload(audioTracks: { [key: string]: string }, onload: () => void) {
    this.audioTracks = audioTracks
    for (const url of Object.values(this.audioTracks)) {
      const audio = new Audio()

      const cb = () => {
        onload()
      }

      audio.addEventListener('canplaythrough', cb, false)
      audio.src = url

      setTimeout(() => {
        if (audio.readyState !== 4) {
          this.audioTracksFailed[url] = true
          onload()
          audio.removeEventListener('canplaythrough', cb)
          console.error('Failed to load audio track: ', url)
        }
      }, 10000)
    }
  }

  playMusic(name: string) {
    const track = this.audioTracks[name]
    if (!track) {
      console.warn('Requested music track was not preloaded:', name)
      return
    }

    if (this.audioTracksFailed[track]) return

    if (this.musicPlaying) return
    this.musicPlaying = new Audio(track)
    this.musicPlaying.volume = this.musicVolume * 0.5
    this.musicPlaying.play()
    this.musicPlaying.loop = true
  }

  playAudio(name: string, reps = 1) {
    const track = this.audioTracks[name]
    if (!track) {
      console.warn('Requested effect track was not preloaded:', name)
      return
    }

    if (this.audioTracksFailed[track]) return

    for (let i = 0; i < reps; i++) {
      setTimeout(() => {
        const audio = new Audio(track)
        audio.volume = this.effectsVolume
        audio.play()
      }, 200 * i)
    }
  }

  changeMusicVolume(newVolume: number) {
    this.musicVolume = newVolume
  }

  changeEffectsVolume(newVolume: number) {
    this.effectsVolume = newVolume
  }
}

const GameAudio = new _GameAudio()

export default GameAudio

