import { app, BrowserWindow, ipcMain } from "electron"
import { fileURLToPath } from "url"
import fs from "fs";
import searchFiles from "./lib.js";

import path from 'path'

let win;
let wid = 800;
let bd="/home/Doors"

function searchFilesRecursive(directory, query, baseDir=bd, results = [], dirs = []) {
  // Limit Search
  // if(results.length>8 || dirs.length>8) return [results,dirs];
  try {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      // If the file name includes the query, add it
      if (item.name.toLowerCase().includes(query.toLowerCase()) && !item.isDirectory()) {
        results.push(path.relative(baseDir, fullPath));
      }
      // If the folder name includes the query, add it
      if (item.name.toLowerCase().includes(query.toLowerCase()) && item.isDirectory()) {
	// console.log(fullPath);
        dirs.push(path.relative(baseDir, fullPath));
      }
      // Recurse into directories
      if (item.isDirectory() && path.relative(baseDir,fullPath)[0]!='.') {
        searchFilesRecursive(directory=fullPath, query=query, results=results, dirs=dirs);
      }
    }
  } catch (error) {
    console.error("Error reading directory", directory, error);
  }
  return [results,dirs];
}

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

  // win.loadFile('dist/index.html')
  win.loadURL('http://localhost:5173');
}

// Handle search requests from the renderer
ipcMain.handle("perform-search", async (event, query) => {
  const searchDir = "/home/Doors"; // Adjust this base directory as needed
  // const DirResults = searchFiles(query,searchDir,2);
  // return searchFiles(query,searchDir,2);
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
