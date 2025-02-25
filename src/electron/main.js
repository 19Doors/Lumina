import { app, BrowserWindow, globalShortcut, ipcMain } from "electron"
import {searchFiles, getAI} from "./lib.js";
import path from 'path'
import { exec } from "child_process";

let win;
let wid = 800;
let height;
switch (process.platform) {
  case "win32":
    console.log("win32");
    height: 150;
    break;

  case "linux":
    console.log("linux");
    height: 50;
    break;

  case "darwin":
    console.log("darwin");
    height: 150;
    break;

  default:
    console.log("default");
    height: 200;
    break;
}

function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    '.',
    '/src/electron/preload.cjs'
  )
}

const createWindow = () => {
  win = new BrowserWindow({
    width: wid,
    height: height,
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

const searchDir = app.getPath('home');
// Handle search requests from the renderer
ipcMain.handle("perform-search", async (event, query) => {
  // const searchDir = "/home/Doors"; // Adjust this base directory as needed
  return searchFiles(searchDir, query);
});

ipcMain.on("adjust-height", (e, nH) => {
  win.setBounds({width: wid, height: nH});
})
ipcMain.on("exec", (e, x) => {
  console.log(x);
  exec('xdg-open '+ searchDir + "/" + x, (err, stdout, stderr) => {
  if (err) console.error(err);
});
  console.log("OK EXEC");
})

ipcMain.handle("getPath", (e) => {
  return searchDir;
})

ipcMain.handle("getAIQuery", (e,query) => {
  console.log("AII");
  return getAI(query);
})


app.whenReady().then(() => {
  createWindow();
  globalShortcut.register("CommandOrControl+I", () => {
    console.log("Shortcut Registered");
      if (win.isMinimized()) {
        win.restore();
        win.show();
        win.focus();
      } else {
        win.minimize();
      }
  });
  // app.on("activate", () => {
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow();
  // });
})
