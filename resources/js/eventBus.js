const eventBus = {
  listeners: {},

  on(event, callback) {
    const wrappedCallback = (e) => callback(e.detail);
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push({ original: callback, wrapped: wrappedCallback });
    document.addEventListener(event, wrappedCallback);
  },

  dispatch(event, data) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },

  remove(event, callback) {
    if (this.listeners[event]) {
      const listenerObj = this.listeners[event].find(listener => listener.original === callback);
      if (listenerObj) {
        document.removeEventListener(event, listenerObj.wrapped);
        this.listeners[event] = this.listeners[event].filter(listener => listener.original !== callback);
      }
    }
  },
};

export default eventBus;
