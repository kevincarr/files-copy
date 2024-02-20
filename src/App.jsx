import React from "react";
import { useState, useEffect, useRef } from "react";

function App() {
  const [paths, setpaths] = useState([,,null]);
  const pathRef = useRef();
  pathRef.current = paths;
  
  const [progress, setProgress] = useState("0");
  const progressRef = useRef();
  progressRef.current = progress;

  const returnPaths = async function() {
    const result=await window.electron.folderPathsGet();
    setpaths(result);
  }
  const dirPathGet = async function() { 
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
  const filesUpdate = async function(){
    let myTo=pathRef.current[1];
    let myFrom=pathRef.current[0].split(".webpack")[0];
    if(myFrom.slice(-1)==="\\"){

      myFrom=myFrom.slice(0, -1);
    }
    myFrom=myFrom+PATH_DELIMTER+"copyFolderSync";
    const myFromRoot=myFrom;

    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const myToRoot=myTo;
    myTo=myTo+PATH_DELIMTER+"copyFolderSync";
    
    console.log("***** myFrom="+myFrom);
    console.log("***** myTo"+myTo);
    //let result=await window.electron.copyFolderSync(myFrom,myTo);
    //setProgress("10%");

    //const result=await window.electron.copyFolderSync();
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
  const filesInstall = async function(event){
    event.target.style.display='none';
    const browseBtn = document.getElementById("browse-btn");
    browseBtn.classList.add("disable");
    browseBtn.classList.remove("button");
    let i=0;
    let myTo=pathRef.current[1];
    let myFrom=pathRef.current[0].split(".webpack")[0];
    if(myFrom.slice(-1)===PATH_DELIMTER){
      myFrom=myFrom.slice(0, -1);
    }

    myFrom=myFrom+PATH_DELIMTER+"copyFolderSync";
    const myFromRoot=myFrom;
    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }

    // Create etmr folder
    const myToRoot=myTo;
    let result=await window.electron.makeFolderSync(myToRoot);
    progressStep(1);

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
    let progressCount=Number(progressRef.current.split("%")[0]);
    for(i=0; i<items.length;i++){
      if(items[i]!=="assets"){
        myFrom=myFromRoot+PATH_DELIMTER+items[i];
        myTo=myToRoot+PATH_DELIMTER+items[i];
        result=await await window.electron.copyFolderSync(myFrom,myTo);
        progressStep(3);
      }
    }

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
    items = await window.electron.getFilesInFolder(myFrom);
    let progressCurrent=Number(progressRef.current.split("%")[0]);
    progressCurrent=(100-progressCurrent)/items.length;

    for(i=0; i<items.length;i++){
      myFrom=myFromRoot+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+items[i];
      myTo=myToRoot+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+items[i];
      console.log("***** myTo="+myTo);
      result=await await window.electron.copyFileSync(myFrom,myTo);
      progressStep(progressCurrent);
    }

    // finish up
    browseBtn.classList.add("button");
    browseBtn.classList.remove("disable");
    event.target.style.display="block";
  }

  const updateOrInstall=()=>{
    if(pathRef.current[2]){
      return(<div className="coral-button select-none install-btn" onClick={()=>filesUpdate()}>
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