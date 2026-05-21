class Stopwatch {
  constructor() {
    this._setlist = null
    this._trackIndex = 0
    this._isRunning = false
    this._elapsedMs = 0
    this._startTs = null
    this._interval = null
    this.onUpdate = null
  }

  get setlist() { return this._setlist }
  get trackIndex() { return this._trackIndex }
  get isRunning() { return this._isRunning }

  get totalElapsedMs() {
    if (this._isRunning) return this._elapsedMs + (Date.now() - this._startTs)
    return this._elapsedMs
  }

  get cumulativeDurationMs() {
    if (!this._setlist) return 0
    let total = 0
    for (let i = 0; i <= this._trackIndex; i++) {
      total += (this._setlist.tracks[i]?.durationSeconds || 0) * 1000
    }
    return total
  }

  // 残り時間 = 最初から現在のトラックまでの秒数合計 - 経過時間
  get remainingMs() {
    return this.cumulativeDurationMs - this.totalElapsedMs
  }

  get isLastTrack() {
    return !this._setlist || this._trackIndex >= this._setlist.tracks.length - 1
  }

  get state() {
    return {
      setlist: this._setlist,
      trackIndex: this._trackIndex,
      isRunning: this._isRunning,
      totalElapsedMs: this.totalElapsedMs,
      remainingMs: this.remainingMs,
      isLastTrack: this.isLastTrack
    }
  }

  load(setlist) {
    this._stop()
    this._setlist = setlist
    this._trackIndex = 0
    this._elapsedMs = 0
    this._startTs = null
    this._notify()
  }

  start() {
    if (this._isRunning || !this._setlist || !this._setlist.tracks.length) return
    this._isRunning = true
    this._startTs = Date.now()
    this._interval = setInterval(() => this._notify(), 100)
    this._notify()
  }

  pause() {
    if (!this._isRunning) return
    this._elapsedMs += Date.now() - this._startTs
    this._isRunning = false
    this._startTs = null
    clearInterval(this._interval)
    this._interval = null
    this._notify()
  }

  lap() {
    if (!this._setlist || this.isLastTrack) return
    this._trackIndex++
    this._notify()
  }

  reset() {
    this._stop()
    this._trackIndex = 0
    this._elapsedMs = 0
    this._startTs = null
    this._notify()
  }

  _stop() {
    if (this._isRunning) {
      this._elapsedMs += Date.now() - this._startTs
      this._isRunning = false
      this._startTs = null
    }
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
    }
  }

  _notify() {
    if (this.onUpdate) this.onUpdate(this.state)
  }
}
