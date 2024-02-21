import React from "react";
import { useState, useEffect, useRef } from "react";

import packageJson from '../package.json';

function App() {
  const [paths, setpaths] = useState([,,null]);
  const pathRef = useRef();
  pathRef.current = paths;
  
  const [progress, setProgress] = useState("0%");
  const progressRef = useRef();
  progressRef.current = progress;

  const returnPaths = async function() {
    const result=await window.electron.folderPathsGet();
    setpaths(result);
  }
  const dirPathGet = async function() {
    setProgress("0%");
    const browseBtn = document.getElementById("browse-btn");
    if(browseBtn.classList.contains("button")){
      const result=await window.electron.directorySelect();
      if(result){
        setpaths(result);
      }
    }
  }

  useEffect(()=>{
    returnPaths();
  }, []);

  const PATH_DELIMTER="\\";
  const isInstalled=()=>{
    if(pathRef.current[2]){
      return(<>
        <div>
          An ETMR Optimizer has been detected, choose "Update" to update or fix this version.
        </div><br/>
      </>);
    }
  }

  const confirmExit = () => {
    let text = "Click OK if you are sure you want to close this application.";
    if (confirm(text) == true) {
      window.electron.onExit();
    }
  }
  const progressStep=(myStep)=>{
    let progressStep=Number(progressRef.current.split("%")[0]);
    progressStep=progressStep+myStep;
    setProgress(progressStep+"%");
  }

  const folderAdd=async function(myTo){
    let result=await window.electron.makeFolderSync(myTo);
    progressStep(1);
    return true;
  }
  const filesCopy = async function(){
    const browseBtn = document.getElementById("browse-btn");
    browseBtn.classList.add("disable");
    browseBtn.classList.remove("button");
    let i=0;
    let result=false;

    let myFrom=pathRef.current[0].split(PATH_DELIMTER+".webpack")[0];
    myFrom=myFrom.split(PATH_DELIMTER+"app-"+packageJson.version)[0];
    myFrom=myFrom+PATH_DELIMTER+"copyFolderSync";
    const myFromRoot=myFrom;
    let myTo=pathRef.current[1];
    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const myToRoot=myTo;

    // copy files in root
    let items = await window.electron.getFilesInFolder(myFrom);
    for(i=0; i<items.length;i++){
      myFrom=myFromRoot+PATH_DELIMTER+items[i];
      myTo=myToRoot+PATH_DELIMTER+items[i];
      result=await await window.electron.copyFileSync(myFrom,myTo);
      progressStep(1);
    }

    // Copy folders in root
    myFrom=myFromRoot;
    myTo=myToRoot;
    items = await window.electron.getFoldersInFolder(myFrom);
    for(i=0; i<items.length;i++){
      if(items[i]!=="assets"){
        myFrom=myFromRoot+PATH_DELIMTER+items[i];
        myTo=myToRoot+PATH_DELIMTER+items[i];
        result=await await window.electron.copyFolderSync(myFrom,myTo);
        progressStep(3);
      }
    }
    
    /*
    browseBtn.classList.add("button");
    browseBtn.classList.remove("disable");
    */
  }

  const filesInstall = async function(event){
    event.target.style.display='none';
    setProgress("0%");

    let myFrom=pathRef.current[0].split(PATH_DELIMTER+".webpack")[0];
    myFrom=myFrom.split(PATH_DELIMTER+"app-"+packageJson.version)[0];
    myFrom=myFrom+PATH_DELIMTER+"copyFolderSync";
    const myFromRoot=myFrom;

    let myTo=pathRef.current[1];
    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const myToRoot=myTo;

    // Create etmr folder
    let result=await window.electron.makeFolderSync(myToRoot);
    progressStep(1);

    result = await filesCopy(event);

    // empty folders in assets
    myTo=myToRoot+PATH_DELIMTER+"assets";
    result=await folderAdd(myTo);
    result=await folderAdd(myTo+PATH_DELIMTER+"Workday");
    result=await folderAdd(myTo+PATH_DELIMTER+"_Photos");
    myTo=myTo+PATH_DELIMTER+"Meetings";
    result=await folderAdd(myTo);
    result=await folderAdd(myTo+PATH_DELIMTER+"PDFs");
    result=await folderAdd(myTo+PATH_DELIMTER+"Save Files"); 

        // copy files in _Photos
    myFrom=myFromRoot+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos";
    myTo=myToRoot+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos";
    const items = await window.electron.getFilesInFolder(myFrom);
    let progressCurrent=Number(progressRef.current.split("%")[0]);
    progressCurrent=(100-progressCurrent)/items.length;

    for(let i=0; i<items.length;i++){
      myFrom=myFromRoot+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+items[i];
      myTo=myToRoot+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+items[i];
      result=await await window.electron.copyFileSync(myFrom,myTo);
      progressStep(progressCurrent);
    }

    // finish up
    setTimeout(() => {
      alert("Install completed successfully.");
      window.electron.onExit();
    }, 500);
    //event.target.style.display="block";
  }

  const filesUpdate = async function(event){
    event.target.style.display='none';
    setProgress("0%");

    let myFrom=pathRef.current[0].split(PATH_DELIMTER+".webpack")[0];
    myFrom=myFrom.split(PATH_DELIMTER+"app-"+packageJson.version)[0];
    myFrom=myFrom+PATH_DELIMTER+"copyFolderSync";
    const myFromRoot=myFrom;

    let myTo=pathRef.current[1];
    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const myToRoot=myTo;  

    myTo=myToRoot;
    let items = await window.electron.getFoldersInFolder(myTo);
    let result=true;
    for(let i=0; i<items.length;i++){
      if(items[i].includes("app-")){
        result=await await window.electron.deleteFolderSync(myTo+PATH_DELIMTER+items[i]);
        progressStep(2);
      }
    }
    myTo=myToRoot+PATH_DELIMTER+"packages";
    result=await await window.electron.deleteFolderSync(myTo);
    progressStep(2);

    myTo=myToRoot+PATH_DELIMTER+"app.ico";
    result=await await window.electron.deleteFolderSync(myTo);
    progressStep(1);

    myTo=myToRoot+PATH_DELIMTER+"ETMR Optimizer.exe";
    result=await await window.electron.deleteFolderSync(myTo);
    progressStep(1);

    result = await filesCopy(event);

    setProgress("100%");

    // finish up
    setTimeout(() => {
      alert("Update completed successfully.");
      window.electron.onExit();
    }, 500);
  }

  const updateOrInstall=()=>{
    if(pathRef.current[2]){
      return(<div className="coral-button select-none install-btn" onClick={(event)=>filesUpdate(event)}>
        Update 
      </div>);
    } else {
      return(<div className="coral-button select-none install-btn" onClick={(event)=>filesInstall(event)}>
        Install 
      </div>);
    }
  }
  const progressBar=()=>{
    return(<>
      <br/>
      <div className="progress-container">
        <div className="progress-bar" style={{width:progressRef.current}}>

        </div>
      </div>
    </>);
  }

  return (<>
    <div className="bg-abt-blue-dark text-white text-xs">
      <div className="container select-none">
      Update or Install the ETMR Optimizer
      </div>
    </div>
    <div className="container text-base">
      {isInstalled()}
      <div>
      Select the location for the ETMR Optimizer
      </div>
      <div className="float-left">
        <div className="browse-container flex-container">
          <div id="location" className="result">{pathRef.current[1]}</div>
          <div id="browse-btn" className="select-none button" onClick={()=>dirPathGet()} >Browse</div>
        </div>
      </div>
      <div className="clear-both"></div>
        {progressBar()}
        {updateOrInstall()}
        <div className="coral-button select-none cancel-btn" onClick={()=>confirmExit()}>
          Exit
        </div>
    </div>
  </>);
}

export default App;