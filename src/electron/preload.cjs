const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  searchFiles: (query) => ipcRenderer.invoke("perform-search", query),
  adjustHeight: (height) => ipcRenderer.send("adjust-height", height),
});
