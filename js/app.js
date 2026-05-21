// ===== Helpers =====

function formatTime(ms) {
  const abs = Math.abs(ms)
  const totalSec = Math.floor(abs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const sign = ms < 0 ? '-' : ''
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${sign}${h}:${mm}:${ss}`
  return `${sign}${mm}:${ss}`
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function parseDuration(str) {
  const t = str.trim()
  if (t.includes(':')) {
    const parts = t.split(':').map(v => parseInt(v) || 0)
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return parseInt(t) || 0
}

function totalDuration(setlist) {
  return (setlist?.tracks || []).reduce((a, t) => a + t.durationSeconds, 0)
}

// ===== State =====

const sw = new Stopwatch()
let editingSetlist = null
let deleteTargetId = null

// ===== Navigation =====

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}

// ===== Stopwatch UI =====

sw.onUpdate = function(state) {
  const { setlist, trackIndex, isRunning, totalElapsedMs, remainingMs, isLastTrack } = state

  const track = setlist?.tracks[trackIndex]

  // Setlist name
  const nameEl = document.getElementById('sw-setlist-name')
  nameEl.textContent = setlist ? setlist.name || '(名称未設定)' : 'セットリスト未選択'

  // Track info
  const numEl = document.getElementById('sw-track-number')
  const nameTrackEl = document.getElementById('sw-track-name')
  if (track) {
    const total = setlist.tracks.length
    numEl.textContent = `Track ${trackIndex + 1} / ${total}`
    nameTrackEl.textContent = track.name || '(タイトルなし)'
    nameTrackEl.classList.remove('placeholder')
  } else {
    numEl.textContent = ''
    nameTrackEl.textContent = 'セットリストを選択してください'
    nameTrackEl.classList.add('placeholder')
  }

  // Times
  document.getElementById('sw-elapsed').textContent = formatTime(totalElapsedMs)
  const remEl = document.getElementById('sw-remaining')
  remEl.textContent = formatTime(remainingMs)
  remEl.classList.toggle('over', remainingMs < 0)

  // Controls
  const btnStartPause = document.getElementById('btn-start-pause')
  const btnLap = document.getElementById('btn-lap')

  if (!setlist || !setlist.tracks.length) {
    btnStartPause.disabled = true
    btnStartPause.textContent = '▶ スタート'
    btnLap.disabled = true
  } else if (isRunning) {
    btnStartPause.disabled = false
    btnStartPause.innerHTML = '⏸ 一時停止'
    btnLap.disabled = isLastTrack
  } else {
    btnStartPause.disabled = false
    btnStartPause.innerHTML = totalElapsedMs > 0 ? '▶ 再開' : '▶ スタート'
    btnLap.disabled = isLastTrack
  }

  // Track list highlight
  document.querySelectorAll('.track-item').forEach((el, i) => {
    el.classList.toggle('current', i === trackIndex && !!setlist)
  })

  // Scroll current track into view
  const currentEl = document.querySelector('.track-item.current')
  if (currentEl) {
    currentEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

// ===== Main Screen =====

function renderTrackList(setlist) {
  const container = document.getElementById('track-list')
  const emptyEl = document.getElementById('tracklist-empty')
  const headerMeta = document.getElementById('tracklist-total')

  if (!setlist || !setlist.tracks.length) {
    container.innerHTML = ''
    emptyEl.style.display = 'flex'
    headerMeta.textContent = ''
    return
  }

  emptyEl.style.display = 'none'
  headerMeta.textContent = `合計 ${formatDuration(totalDuration(setlist))}`

  container.innerHTML = setlist.tracks.map((track, i) => `
    <div class="track-item" data-index="${i}">
      <div class="track-playing-indicator"></div>
      <div class="track-num">${i + 1}</div>
      <div class="track-info">
        <div class="track-item-name">${escapeHtml(track.name || '(タイトルなし)')}</div>
      </div>
      <div class="track-dur">${formatDuration(track.durationSeconds)}</div>
    </div>
  `).join('')

  // Memo
  const memoSection = document.getElementById('memo-section')
  if (setlist.memo?.trim()) {
    memoSection.style.display = 'block'
    document.getElementById('memo-text').textContent = setlist.memo
  } else {
    memoSection.style.display = 'none'
  }

  // Re-apply highlight from stopwatch state
  const idx = sw.trackIndex
  document.querySelectorAll('.track-item').forEach((el, i) => {
    el.classList.toggle('current', i === idx)
  })
}

function loadSetlistIntoStopwatch(setlist) {
  sw.load(setlist)
  renderTrackList(setlist)
  showScreen('screen-main')
}

// ===== Setlist List Screen =====

function openSetlistsScreen() {
  renderSetlistList()
  showScreen('screen-setlists')
}

function renderSetlistList() {
  const container = document.getElementById('setlist-list')
  const setlists = db.getSetlists()

  if (!setlists.length) {
    container.innerHTML = '<div class="empty-list">セットリストがありません<br>右上の「新規」から作成してください</div>'
    return
  }

  container.innerHTML = setlists.map(s => {
    const trackCount = s.tracks.length
    const dur = formatDuration(totalDuration(s))
    return `
      <div class="setlist-card" data-id="${s.id}">
        <div class="setlist-card-body" data-action="load" data-id="${s.id}">
          <div class="setlist-card-info">
            <div class="setlist-card-name">${escapeHtml(s.name || '(名称未設定)')}</div>
            <div class="setlist-card-meta">${trackCount}曲 · ${dur}</div>
          </div>
          <div class="setlist-card-arrow">▶</div>
        </div>
        <div class="setlist-card-actions">
          <button class="setlist-action-btn" data-action="edit" data-id="${s.id}">✎ 編集</button>
          <button class="setlist-action-btn danger" data-action="delete" data-id="${s.id}">削除</button>
        </div>
      </div>
    `
  }).join('')
}

// ===== Editor Screen =====

function openEditor(setlist) {
  editingSetlist = JSON.parse(JSON.stringify(setlist))
  renderEditorForm()
  showScreen('screen-editor')
}

function renderEditorForm() {
  document.getElementById('editor-name').value = editingSetlist.name
  document.getElementById('editor-memo').value = editingSetlist.memo
  renderEditorTracks()
}

function renderEditorTracks() {
  const container = document.getElementById('editor-tracks')
  container.innerHTML = editingSetlist.tracks.map((track, i) => `
    <div class="track-editor-item" data-index="${i}">
      <div class="track-editor-num">${i + 1}</div>
      <div class="track-editor-fields">
        <input class="track-editor-input" type="text"
          placeholder="曲名" value="${escapeHtml(track.name)}"
          data-field="name" data-index="${i}">
        <div class="track-editor-row">
          <input class="track-editor-input duration-input" type="text"
            placeholder="3:30" value="${formatDuration(track.durationSeconds)}"
            data-field="duration" data-index="${i}">
          <span class="track-dur-hint">分:秒</span>
        </div>
      </div>
      <button class="track-delete-btn" data-action="delete-track" data-index="${i}">−</button>
    </div>
  `).join('')
}

function collectEditorData() {
  editingSetlist.name = document.getElementById('editor-name').value.trim()
  editingSetlist.memo = document.getElementById('editor-memo').value.trim()
  document.querySelectorAll('[data-field="name"]').forEach(el => {
    const i = parseInt(el.dataset.index)
    editingSetlist.tracks[i].name = el.value.trim()
  })
  document.querySelectorAll('[data-field="duration"]').forEach(el => {
    const i = parseInt(el.dataset.index)
    editingSetlist.tracks[i].durationSeconds = parseDuration(el.value)
  })
}

// ===== Security helper =====

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ===== Delete Modal =====

function showDeleteModal(id) {
  deleteTargetId = id
  document.getElementById('modal-overlay').classList.remove('hidden')
}
function hideDeleteModal() {
  deleteTargetId = null
  document.getElementById('modal-overlay').classList.add('hidden')
}

// ===== Event Wiring =====

function init() {
  // Start/Pause toggle
  document.getElementById('btn-start-pause').addEventListener('click', () => {
    if (sw.isRunning) sw.pause()
    else sw.start()
  })

  // Lap (next track)
  document.getElementById('btn-lap').addEventListener('click', () => sw.lap())

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => sw.reset())

  // Open setlists from main screen
  document.getElementById('btn-open-setlists').addEventListener('click', openSetlistsScreen)

  // Setlists screen: back
  document.getElementById('btn-back-from-setlists').addEventListener('click', () => showScreen('screen-main'))

  // Setlists screen: new
  document.getElementById('btn-new-setlist').addEventListener('click', () => openEditor(db.newSetlist()))

  // Setlist list: delegation
  document.getElementById('setlist-list').addEventListener('click', e => {
    const actionEl = e.target.closest('[data-action]')
    if (!actionEl) return
    const { action, id } = actionEl.dataset
    if (action === 'load') {
      const setlist = db.getSetlist(id)
      if (setlist) loadSetlistIntoStopwatch(setlist)
    } else if (action === 'edit') {
      const setlist = db.getSetlist(id)
      if (setlist) openEditor(setlist)
    } else if (action === 'delete') {
      showDeleteModal(id)
    }
  })

  // Editor: cancel
  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    editingSetlist = null
    showScreen('screen-setlists')
    renderSetlistList()
  })

  // Editor: save
  document.getElementById('btn-save-edit').addEventListener('click', () => {
    collectEditorData()
    db.saveSetlist(editingSetlist)
    editingSetlist = null
    renderSetlistList()
    showScreen('screen-setlists')
  })

  // Editor: name input
  document.getElementById('editor-name').addEventListener('input', e => {
    if (editingSetlist) editingSetlist.name = e.target.value
    document.getElementById('btn-save-edit').disabled = !e.target.value.trim()
  })

  // Editor: add track
  document.getElementById('btn-add-track').addEventListener('click', () => {
    collectEditorData()
    editingSetlist.tracks.push(db.newTrack())
    renderEditorTracks()
    // Scroll to bottom of editor
    const scroll = document.querySelector('.editor-scroll')
    setTimeout(() => scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' }), 50)
  })

  // Editor: track field changes & delete (delegation)
  document.getElementById('editor-tracks').addEventListener('input', e => {
    const el = e.target
    if (!el.dataset.field) return
    const i = parseInt(el.dataset.index)
    if (el.dataset.field === 'name') editingSetlist.tracks[i].name = el.value
    // duration is parsed on save
  })

  document.getElementById('editor-tracks').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="delete-track"]')
    if (!btn) return
    collectEditorData()
    const i = parseInt(btn.dataset.index)
    editingSetlist.tracks.splice(i, 1)
    renderEditorTracks()
  })

  // Delete modal
  document.getElementById('modal-confirm-delete').addEventListener('click', () => {
    if (deleteTargetId) {
      // If currently loaded setlist is deleted, reset stopwatch
      if (sw.setlist?.id === deleteTargetId) sw.load(null)
      db.deleteSetlist(deleteTargetId)
      renderSetlistList()
      renderTrackList(null)
    }
    hideDeleteModal()
  })
  document.getElementById('modal-cancel').addEventListener('click', hideDeleteModal)
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideDeleteModal()
  })

  // Initial render
  sw.onUpdate(sw.state)
  renderTrackList(null)
}

document.addEventListener('DOMContentLoaded', init)
