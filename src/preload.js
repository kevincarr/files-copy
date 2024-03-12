// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    onExit: () => ipcRenderer.invoke("onExit"),
    getFilesInFolder: (folderPath) =>
    ipcRenderer.invoke("getFilesInFolder", folderPath),
    getFoldersInFolder: (folderPath) =>
    ipcRenderer.invoke("getFoldersInFolder", folderPath),
    folderPathsGet: () => ipcRenderer.invoke("folderPathsGet"),
    directorySelect: (pathArray) => ipcRenderer.invoke("directorySelect",pathArray),
    makeFolderSync: (event,folder) => ipcRenderer.invoke("makeFolderSync",event,folder),
    deleteFolderSync: (event,folder) => ipcRenderer.invoke("deleteFolderSync",event,folder),
    copyFileSync: (event,from,to) => ipcRenderer.invoke("copyFileSync",event,from,to),
    copyFolderSync: (event,from,to) => ipcRenderer.invoke("copyFolderSync",event,from,to),
    makeTextFile: (fileText, filePath) => ipcRenderer.invoke("makeTextFile", fileText, filePath),
});