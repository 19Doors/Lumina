const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  searchFiles: (query) => ipcRenderer.invoke("perform-search", query),
  adjustHeight: (height) => ipcRenderer.send("adjust-height", height),
  getPath: () => ipcRenderer.invoke("getPath"),
  exec: (x) => ipcRenderer.send("exec",x),
  getAIQuery: (x) => ipcRenderer.invoke("getAIQuery", x),
});
