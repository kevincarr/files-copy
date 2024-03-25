import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import {
	existsSync,
	readdirSync,
  readFileSync,
  } from "fs";
import { resolve } from "path";
const path = require('path');
const fs = require('fs');

const TEXT_ENCODING = "latin1";

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
    icon: "src/icons/icon.ico",
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

ipcMain.handle("onExit", () => {
  app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("getFilesNewInFolder", async (e,date,folderPath) => {
  const directoryContent = fs.readdirSync(folderPath);
  let newFiles=[];
  let files = directoryContent.filter((filename) => {
    if(fs.statSync(`${folderPath}/${filename}`).isFile()){
      let fileDateArr=[];
      let fileDate="";
      fileDateArr=(fs.statSync(`${folderPath}/${filename}`).birthtime).toString().split(" ");
      // Thu Jul 29 2021 11:29:34 GMT-0500 (Central Daylight Time)
      let myString=( "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(fileDateArr[1]) / 3 + 1 ).toString();
      myString=myString.length<2?"0"+myString:myString;
      fileDate=fileDateArr[3]+myString;
      myString=(Number(fileDateArr[2])+1).toString();
      myString=myString.length<2?"0"+myString:myString;
      fileDate=fileDate+myString;
      if(Number(fileDate)>date){
        newFiles.push(filename);
      }
    }
  });
  return newFiles;
});

ipcMain.handle("getFilesInFolder", async (e,folderPath) => {
  return readdirSync(path.resolve(folderPath), { withFileTypes: true })
    .filter((item) => item.isFile())
    .map((item) => item.name);
});
ipcMain.handle("getFoldersInFolder", async (e,folderPath) => {
  return readdirSync(path.resolve(folderPath), { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
});

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
  myOpenPath=path.resolve(desktopDir, 'etmr-optimizer');
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

async function makeFolderSync(folder) {
  if (!existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  return true;
};
ipcMain.handle('makeFolderSync', async (event, folder) => {
  let result=await makeFolderSync(folder);
  return result;
});

async function copyFileSync(from, to) {
  if (fs.lstatSync(path.join(from)).isFile()) {
    if(from.slice(-5)===".asar"){
      process.noAsar = true;
    }
    //const originalFs = require('original-fs');
    //originalFs.copyFileSync(path.join(from), path.join(to));
    fs.copyFileSync(path.join(from), path.join(to));
    process.noAsar = false;
  }
}

ipcMain.handle('copyFileSync', async (event, from, to) => {
  copyFileSync(from,to);
  return true;
});

ipcMain.handle('renameFile', async (event, from, to) => {
  fs.rename(from,to);
  return true;
});

async function copyFolderSync(from, to) {
  let result=await makeFolderSync(to);
  fs.readdirSync(from).forEach((element) => {
    process.noAsar = true;
    if (fs.lstatSync(path.join(from, element)).isFile()) {
        fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
        copyFolderSync(path.join(from, element), path.join(to, element));
    }
    process.noAsar = false;
  });
}
ipcMain.handle('copyFolderSync', async (event, from, to) => {
  copyFolderSync(from,to);
  return true;
});

async function deleteFolderSync(folder) {
  let isCompelte=false;
  if (existsSync(folder)) {
    fs.rm(folder, { recursive: true, force: true }, err => {
      if (err) {
        throw err
      } else {
        isCompelte=true;
      }
    })
  }
  return isCompelte;
};
ipcMain.handle('deleteFolderSync', async (event, folder) => {
  let result=await deleteFolderSync(folder);
  return result;
});

function WriteFile(fileText,filePath){
  try {
    const rawData = fileText;
    const data = Buffer.from(rawData);
    fs.writeFileSync(filePath, data, { flag: 'ax' });
  } catch (e) {
    console.log(e); // will log an error because file already exists
  }
}
async function makeTextFile(fileText, filePath){
  if (fs.existsSync(filePath)) {
    fs.rm(filePath, { recursive: true, force: true }, err => {
      if (err) {
        //throw err
      } else {
        WriteFile(fileText,filePath);
      }
    })
  } else {
    WriteFile(fileText,filePath);
  }
  return filePath;
};

ipcMain.handle("makeTextFile", async (event, fileText, filePath) => {
  let result=await makeTextFile(fileText, filePath);
  return result;
});

const readText = (filePath) => {
  let data="";
  
  if(filePath){
      if (fs.existsSync(filePath)) {
      data = fs.readFileSync(filePath,{encoding:TEXT_ENCODING, flag:'r'});
    }
  } 
  return data;
};