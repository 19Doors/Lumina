import { app, BrowserWindow, ipcMain } from "electron"
import searchFiles from "./lib.js";
import path from 'path'

let win;
let wid = 800;

function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    '.',
    '/src/electron/preload.cjs'
  )
}
console.log(getPreloadPath());
const createWindow = () => {
  win = new BrowserWindow({
    width: wid,
    height: 50,
    frame: false,
    resizable: false,
    // transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      // preload: path.join(__dirname,"./preload.js"),
      preload: getPreloadPath(),
    },
  })

  win.loadFile('dist/index.html')
  // win.loadURL('http://localhost:5173');
}

// Handle search requests from the renderer
ipcMain.handle("perform-search", async (event, query) => {
  // const searchDir = "/home/Doors"; // Adjust this base directory as needed
  const searchDir = app.getPath('home');
  return searchFiles(searchDir, query);
});

ipcMain.on("adjust-height", (e, nH) => {
  win.setBounds({width: wid, height: nH});
})


app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
})
