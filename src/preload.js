// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
    onExit: () => ipcRenderer.invoke("onExit"),
    folderPathsGet: () => ipcRenderer.invoke("folderPathsGet"),
    directorySelect: (pathArray) => ipcRenderer.invoke("directorySelect",pathArray),
    makeFolderSync: (event,folder) => ipcRenderer.invoke("makeFolderSync",event,folder),
    copyFolderSync: (event,from,to) => ipcRenderer.invoke("copyFolderSync",event,from,to),
});