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



ipcMain.handle('directorySelect', async () => {
  let isInstalled=false;
  const homeDir = app.getPath('home');
  let myOpenPath = path.resolve(homeDir, 'Desktop');
  //let myTestPath=path.resolve(desktopDir, 'etmr-optimizer');
  if (existsSync(path.resolve(myOpenPath, 'etmr-optimizer'))) {
    myOpenPath = path.resolve(myOpenPath, 'etmr-optimizer');
  }



  const result = await dialog.showOpenDialog(null, {
    defaultPath:myOpenPath,
    properties: ['openDirectory']
})
if (result.canceled) {
    return null
} else {
/*
    const dir = result.filePaths[0];
    // check if ETMR is already installed
    const dirArray=dir.split("/");
    let myTestPath=path.resolve(dir, 'assets');
    myTestPath=path.resolve(dir, 'Workday');
    if(dirArray[dirArray.length-1]==="assets"){

    }
    if (existsSync(path.resolve(dir, 'etmr-optimizer'))) {
      isInstalled=true;
    }
*/ 
    return([__dirname,myOpenPath,isInstalled]);
}

/*
  const result = await dialog.showOpenDialog({
    title: 'Choose Location',
    defaultPath: path.join(desktopDir, '/etmr-optimizer'),
    properties: ['openDirectory']
  });

  console.log('directories selected=', result);
  /*
  if (existsSync(path.resolve(result.filePaths, 'etmr-optimizer'))) {
    isInstalled=true;
  }
  return([__dirname,result.filePaths,isInstalled]);
  */
});