class LocalStorageServices {
  get(key) {
    try {
      let data = localStorage.getItem(key) || '';

      if (!key) {
        return null;
      }

      if (data) {
        return JSON.parse(data);
      }

      return null;
    }
    catch (e) {
      console.error("Error get from localStorage", e);
      return null;
    }
  }

  set(key, data) {
    try {
      if (!key) {
        return null;
      }

      localStorage.setItem(key, JSON.stringify(data));
    }

    catch (e) {
      console.error("Error set localStorage");
    }
  }

  remove(key) {
    try {
      if (!key) {
        return null;
      }

      localStorage.removeItem(key);
    }
    catch (e) {
      console.error("Error remove localStorage");
    }
  }

  clear() {
    // Backup theme so that we can restore it
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    localStorage.setItem('theme', theme);
  }

  length() {
    return localStorage.length;
  }
}

export default new LocalStorageServices();
