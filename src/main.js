import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import {
	existsSync,
  } from "fs";

const path = require('path');

app.commandLine.appendSwitch('--no-sandbox'); // This is to run an shared/mapped drives

const IS_DEV = process.env.NODE_ENV === "development";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.removeMenu(); // Remove the window's menu bar.

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  if(IS_DEV){
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    //mainWindow.setFullScreen(true);
    // REMARK THIS OUT FOR LIVE APPLICATION
    //mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("folderPathsGet", () => {
  const homeDir = app.getPath('home');
  const desktopDir = path.resolve(homeDir, 'Desktop');
  let myOpenPath = desktopDir;
  let isInstalled=false;
  if (existsSync(path.resolve(myOpenPath, 'etmr-optimizer'))) {
    myOpenPath=path.resolve(myOpenPath, 'etmr-optimizer');
    if (existsSync(path.resolve(myOpenPath, 'assets'))) {
      myOpenPath=path.resolve(myOpenPath, 'assets');
      if (existsSync(path.resolve(myOpenPath, 'Workday'))) {
        isInstalled=true;
      }
    }
  }
  myOpenPath=path.resolve(desktopDir, 'etmr-optimizer')
  return([__dirname,myOpenPath,isInstalled]);
});

ipcMain.handle('directorySelect', async (pathArray) => {
  const homeDir = app.getPath('home');
  const desktopDir = path.resolve(homeDir, 'Desktop');
  let myOpenPath=pathArray[2]?pathArray[1]:desktopDir;
  const result = await dialog.showOpenDialog(null, {
    defaultPath:myOpenPath,
    properties: ['openDirectory']
  })
  if (result.canceled) {
    return null
  } else {
    myOpenPath = result.filePaths[0];
    let isInstalled=false;
    if(myOpenPath.substr(myOpenPath.length - 14)==='etmr-optimizer'){
      myOpenPath = myOpenPath.slice(0, -14);
    }
    let myOpenPathTest=myOpenPath;
    if (existsSync(path.resolve(myOpenPathTest, 'etmr-optimizer'))) {
      myOpenPathTest=path.resolve(myOpenPathTest, 'etmr-optimizer');
      if (existsSync(path.resolve(myOpenPathTest, 'assets'))) {
        myOpenPathTest=path.resolve(myOpenPathTest, 'assets');
        if (existsSync(path.resolve(myOpenPathTest, 'Workday'))) {
          isInstalled=true;
        }
      }
    }
    myOpenPath = path.resolve(myOpenPath, 'etmr-optimizer')
    return([__dirname,myOpenPath,isInstalled]);
  }
});