import { desktopCapturer, app, BrowserWindow, globalShortcut, ipcMain } from "electron"
import fs from 'fs';
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
    // frame: false,
    // resizable: false,
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
  // const nWin = new BrowserWindow({width:800, height:800, x:0, y:0});
  // nWin.loadURL('https://github.com')
  // nWin.once('ready-to-show', () => {
  //   nWin.show()
  // })
  return getAI(query);
})

// async function captureScreenWithoutAppWindow() {
//   // Get a reference to the current window.
//   const mainWindow = win;
//   
//   // Hide the window so it's not captured
//   mainWindow.hide();
//   
//   // Wait a bit for the window to actually be hidden (adjust delay as needed)
//   await new Promise(resolve => setTimeout(resolve, 300));
//   
//   // Capture screen sources. We'll capture all screens and pick one.
//   const sources = await desktopCapturer.getSources({
//     types: ['screen'],
//     thumbnailSize: { width: 1920, height: 1080 } // adjust size as needed
//   });
//   
//   // For simplicity, use the first screen source (you might iterate if you have multiple monitors)
//   const primarySource = sources[0];
//   const screenshotBuffer = primarySource.thumbnail.toPNG();
//   
//   // Define the path where you want to save the screenshot.
//   // This example saves it in the user's home directory.
//   const filePath = path.join(process.env.HOME || process.env.USERPROFILE, 'screenshot.png');
//   
//   // Write the PNG buffer to a file.
//   fs.writeFile(filePath, screenshotBuffer, (err) => {
//     if (err) {
//       console.error("Error saving screenshot:", err);
//     } else {
//       console.log("Screenshot saved successfully at:", filePath);
//     }
//   });
//   
//   // Show the window again.
//   mainWindow.show();
//   
//   return filePath;
// }

// Example usage:
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

// captureScreenWithoutAppWindow()
//   .then((dataUrl) => {
//     // You can now use the data URL, e.g. set it as an image src:
//     // document.getElementById('screenshotImg').src = dataUrl;
//   })
//   .catch((err) => console.error("Error capturing screen:", err));

  // app.on("activate", () => {
  //   if (BrowserWindow.getAllWindows().length === 0) createWindow();
  // });
})
