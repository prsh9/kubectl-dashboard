class TabData {
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }
}

// state
const state = () => ({
  openTabs: {
    items: []
  }
})

// getters
const getters = {
  getOpenTabs: (state) => {
    return state.openTabs.items;
  }
}

// actions
const actions = {
  addOpenTab: function({ commit }, { uid, data } ) {
    commit('addOpenTab', { uid: uid, data: data })
  },

  removeOpenTabByIndex: function({ commit }, index ) {
    commit('removeOpenTab', { index: index })
  }
}

// mutations
const mutations = {
  addOpenTab(state, { uid, data }) {
    state.openTabs.items.push(new TabData(uid, data))
  },
  removeOpenTab(state, { index }) {
    state.openTabs.items.splice(index, 1)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
