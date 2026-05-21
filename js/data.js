const DATA_KEY = 'live_assistant_v1'

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(DATA_KEY)) || { setlists: [] }
  } catch {
    return { setlists: [] }
  }
}

function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

const db = {
  getSetlists() {
    return loadData().setlists
  },

  getSetlist(id) {
    return loadData().setlists.find(s => s.id === id) || null
  },

  saveSetlist(setlist) {
    const data = loadData()
    const idx = data.setlists.findIndex(s => s.id === setlist.id)
    if (idx >= 0) {
      data.setlists[idx] = setlist
    } else {
      data.setlists.push(setlist)
    }
    saveData(data)
  },

  deleteSetlist(id) {
    const data = loadData()
    data.setlists = data.setlists.filter(s => s.id !== id)
    saveData(data)
  },

  newSetlist() {
    return { id: Date.now().toString(), name: '', memo: '', tracks: [] }
  },

  newTrack() {
    return { id: Math.random().toString(36).slice(2), name: '', durationSeconds: 180 }
  }
}
