const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  searchFiles: (query) => ipcRenderer.invoke("perform-search", query),
  adjustHeight: (height) => ipcRenderer.send("adjust-height", height),
  getPath: () => ipcRenderer.invoke("getPath"),
  exec: (x) => ipcRenderer.send("exec",x),
  getAIQuery: (x) => ipcRenderer.invoke("getAIQuery", x),
  parsePDF: (x) => ipcRenderer.invoke("parsePDF", x),
  getCommand: (x) => ipcRenderer.invoke("getCommand", x),
  getEmails: async (x) => await ipcRenderer.invoke("getEmails", x),
});
