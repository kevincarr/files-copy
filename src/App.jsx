import React from "react";
import { useState, useEffect, useRef } from "react";

function App() {
  const [paths, setpaths] = useState([,,null]);
  const pathRef = useRef();
  const PATH_DELIMTER="\\";
  pathRef.current = paths;
  
  const [information, setInformation] = useState(" ");

  const [progress, setProgress] = useState("0%");
  const progressRef = useRef();
  progressRef.current = progress;

  const returnPaths = async function() {
    let result=await window.electron.folderPathsGet();
    let myFrom=result[0].split(PATH_DELIMTER+"1-ETMR Optimizer")[0];
    myFrom=myFrom+PATH_DELIMTER+"1-ETMR Optimizer";
    // ***** CHANGE IN fromRootGet ALSO *****
    //myFrom=myFrom+PATH_DELIMTER+"test"+PATH_DELIMTER+"etmr-optimizer";
    myFrom=myFrom+PATH_DELIMTER+"etmr-optimizer";
    result[0]=myFrom;
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

  const onExit=()=>{
    window.electron.onExit();
  }

  const fromRootGet=()=>{
    let myFrom=pathRef.current[0].split(PATH_DELIMTER+"1-ETMR Optimizer")[0];
    myFrom=myFrom+PATH_DELIMTER+"1-ETMR Optimizer";
    //myFrom=myFrom+PATH_DELIMTER+"test"+PATH_DELIMTER+"etmr-optimizer";
    myFrom=myFrom+PATH_DELIMTER+"etmr-optimizer";
    return myFrom;
  }
  const isInstalled=()=>{
    if(pathRef.current[2]){
      return(<>
        <div className="select-none">
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

    let myFrom=fromRootGet();
    const FROM_ROOT= myFrom;

    let myTo=pathRef.current[1];
    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const TO_ROOT=myTo;

    // copy files in root
    let items = await window.electron.getFilesInFolder(myFrom);
    for(i=0; i<items.length;i++){
      myFrom=FROM_ROOT+PATH_DELIMTER+items[i];
      myTo=TO_ROOT+PATH_DELIMTER+items[i];
      result= await window.electron.copyFileSync(myFrom,myTo);
      setInformation("Installing "+items[i]+".");
      progressStep(10);
    }
    //result = await window.electron.renameFile(TO_ROOT+"ETMR Optimizer.exe",TO_ROOT+"ETMR Optimizer.txt");

    // Copy App folder
    myFrom=FROM_ROOT;
    myTo=TO_ROOT;
    items = await window.electron.getFoldersInFolder(myFrom);
    for(i=0; i<items.length;i++){
      if(items[i]!=="assets"){
        progressStep(3);
        myFrom=FROM_ROOT+PATH_DELIMTER+items[i];
        myTo=TO_ROOT+PATH_DELIMTER+items[i];
        result= await window.electron.copyFolderSync(myFrom,myTo);
        setInformation("Installing "+items[i]+".");
        progressStep(6);
      }
    }
    // update version with asar file
    //let myBase=PATH_DELIMTER+"packages"+PATH_DELIMTER+"update";
    //result = await window.electron.copyFolderSync(FROM_ROOT+myBase,TO_ROOT+myBase);
    //progressStep(3);
    //result= await window.electron.deleteFolderSync(TO_ROOT+myBase+PATH_DELIMTER+"app-1.0.1"+PATH_DELIMTER+"resources"+PATH_DELIMTER+"app.asar");
    //progressStep(3);
    //result = await window.electron.renameFile(TO_ROOT+myBase+PATH_DELIMTER+"app-1.0.1"+PATH_DELIMTER+"resources"+PATH_DELIMTER+"app.asar.txt",TO_ROOT+myBase+PATH_DELIMTER+"app-1.0.1"+PATH_DELIMTER+"resources"+PATH_DELIMTER+"app.asar");
  }
  const getDateString=()=>{
    const today = new Date();
    let myDate=today.getFullYear()+"-"+String(today.getMonth() + 1).padStart(2, '0')+"-"+String(today.getDate()).padStart(2, '0');
    return myDate;
  }
  const filesInstall = async function(event){ 
    document.getElementById('all').classList.add("cursor-progress");
    event.target.style.display='none';
    setInformation("Preparing files");
    setProgress("0%");

    let myFrom=fromRootGet();
    const FROM_ROOT= myFrom;

    let myTo=pathRef.current[1];
    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const TO_ROOT=myTo;

    // Create etmr folder
    setInformation("Preparing your computer");
    let result=await window.electron.makeFolderSync(TO_ROOT);
    progressStep(1);

    setInformation("Installing application files");

    // empty folders in assets
    setInformation("Creating user files and folders");
    myTo=TO_ROOT+PATH_DELIMTER+"assets";
    result=await folderAdd(myTo);
    result=await folderAdd(myTo+PATH_DELIMTER+"Workday");
    result=await folderAdd(myTo+PATH_DELIMTER+"_Photos");
    myTo=myTo+PATH_DELIMTER+"Meetings";
    result=await folderAdd(myTo);
    result=await folderAdd(myTo+PATH_DELIMTER+"PDFs");
    result=await folderAdd(myTo+PATH_DELIMTER+"Save Files");
    progressStep(1);
    
    // empty folders in packages
    myTo=TO_ROOT+PATH_DELIMTER+"packages";
    result=await folderAdd(myTo);
    result=await folderAdd(myTo+PATH_DELIMTER+"update");
    progressStep(10);

    result = await filesCopy(event);

    // copy files in _Photos
    setInformation("Installing assets. (this will take a few moments)");
    myFrom=FROM_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos";
    myTo=TO_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos";
    const myPhotoVersion=TO_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+"_last-updated.txt";
    result= await window.electron.makeTextFile(getDateString()+"\n"+FROM_ROOT, myPhotoVersion);
    
    const myVersion=TO_ROOT+PATH_DELIMTER+"packages"+PATH_DELIMTER+"update"+PATH_DELIMTER+"_last-updated.txt";
    result= await window.electron.makeTextFile(getDateString()+"\n"+FROM_ROOT, myVersion);

    const items = await window.electron.getFilesInFolder(myFrom);
    let progressCurrent=Number(progressRef.current.split("%")[0]);
    progressCurrent=(100-progressCurrent)/items.length;

    for(let i=0; i<items.length;i++){
      myFrom=FROM_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+items[i];
      myTo=TO_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+items[i];
      result= await window.electron.copyFileSync(myFrom,myTo);
      setInformation("Installing "+items[i]+".");
      progressStep(progressCurrent);
    }

    // finish up
    document.getElementById('all').classList.remove("cursor-progress"); 
    setProgress("100%");
    setInformation("Finishing up");
    setTimeout(() => {
      alert("Install completed successfully.");
        onExit();
    }, 500);
    //event.target.style.display="block";
  }

  const filesUpdate = async function(event){
    let i=0;
    document.getElementById('all').classList.add("cursor-progress");
    event.target.style.display='none';
    setInformation("Preparing files");
    setProgress("0%");

    let myFrom=fromRootGet();
    const FROM_ROOT= myFrom;

    let myTo=pathRef.current[1];
    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const TO_ROOT=myTo;

    setInformation("Checking application files");
    let itemsOld = await window.electron.getFoldersInFolder(TO_ROOT);
    let itemsNew = await window.electron.getFoldersInFolder(FROM_ROOT);
    let result=true;
    myTo="";
    for(i=0; i<itemsOld.length;i++){
      if(itemsOld[i].includes("app-")){
        myTo=i;
        break;
      }
    } 

      setInformation("Removing old application files");
      result=true;
      for(i=0; i<itemsOld.length;i++){
        if(itemsOld[i].includes("app-")){
          result=await window.electron.deleteFolderSync(TO_ROOT+PATH_DELIMTER+itemsOld[i]);
          progressStep(2);
        }
      }
      
    myTo=TO_ROOT+PATH_DELIMTER+"packages";
    result= await window.electron.deleteFolderSync(myTo);
    progressStep(2);

    myTo=TO_ROOT+PATH_DELIMTER+"app.ico";
    result= await window.electron.deleteFolderSync(myTo);
    progressStep(1);

    myTo=TO_ROOT+PATH_DELIMTER+"ETMR Optimizer.exe";
    result= await window.electron.deleteFolderSync(myTo);
    progressStep(4);

    // need to force a stop before copying the files 
    await new Promise(resolve => setTimeout(resolve, 2000));
    progressStep(40);
    setInformation("Installing application files");
    result = await filesCopy();
   
    // NEW PHOTOS
    /*
    setInformation("Checking for new photos");
    progressStep(2);
    result=await window.electron.readTextFile(myPhotoVersion);
    result=result?result.toString().split("\n")[0]:false;
    let myDate=result?Number(result.split("-").join("")):19700216; // if file doesn't exist set the date to 1970
    let photosNew=await window.electron.getFilesNewInFolder(myDate,FROM_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER);
    let progressCurrent=Number(progressRef.current.split("%")[0]);
    progressCurrent=(100-progressCurrent)/progressCurrent.length;
    for(i=0; i<photosNew.length;i++){
      myFrom=FROM_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+photosNew[i];
      myTo=TO_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+photosNew[i];
      result= await window.electron.copyFileSync(myFrom,myTo);
      setInformation("Installing "+photosNew[i]+".");
      progressStep(progressCurrent);
    }
    */

    // Update the version number
    progressStep(30);
    setInformation("Finishing up.");
    const myPhotoVersion=TO_ROOT+PATH_DELIMTER+"assets"+PATH_DELIMTER+"_Photos"+PATH_DELIMTER+"_last-updated.txt";
    result= await window.electron.makeTextFile(getDateString()+"\n"+FROM_ROOT, myPhotoVersion);

    const myVersion=TO_ROOT+PATH_DELIMTER+"packages"+PATH_DELIMTER+"update"+PATH_DELIMTER+"_last-updated.txt";
    result= await window.electron.makeTextFile(getDateString()+"\n"+FROM_ROOT, myVersion);

    // finish up
    document.getElementById('all').classList.remove("cursor-progress");
    setInformation("Complete.");
    setProgress("100%");
    setTimeout(() => {
      alert("Update completed successfully.");
      onExit();
    }, 500);
  }

  const startUpdating=(event)=>{
    // const result=returnPaths();
    // wait 2 seconds for the program to udpate
    setTimeout(() => {
      if(pathRef.current[2]){
        filesUpdate(event)
      } else {
        filesInstall(event)
      }
    }, 1000);
  }

  const updateOrInstall=()=>{
    if(pathRef.current[2]){
      return(<div className="coral-button select-none install-btn" onClick={(event)=>startUpdating(event)}>
        Update 
      </div>);
    } else {
      return(<div className="coral-button select-none install-btn" onClick={(event)=>startUpdating(event)}>
        Install 
      </div>);
    }
  }
  const progressBar=()=>{
    return(<>
      <br className="select-none"/>
      <div className="progress-container">
        <div className="progress-bar" style={{width:progressRef.current}}>

        </div>
      </div>
    </>);
  }

  return (<>
  <div id="all" style={{height:"550px"}}>
    <div className="bg-abt-blue-dark text-white text-xs">
      <div className="container select-none">
      Update or Install the ETMR Optimizer
      </div>
    </div>
    <div className="container text-base">
      {isInstalled()}
      <div className="select-none">
        Select the location for the ETMR Optimizer
      </div>
      <div className="float-left">
        <div className="browse-container flex-container">
          <div id="location" className="result cursor-default">{pathRef.current[1]}</div>
          <div id="browse-btn" className="select-none button" onClick={()=>dirPathGet()} >Browse</div>
        </div>
      </div>
      <div className="clear-both"></div>
        <br  className="select-none" />
        <div className="select-none">{information}&nbsp;</div>
          {progressBar()}
          {updateOrInstall()}
          <div className="coral-button select-none cancel-btn" onClick={()=>confirmExit()}>
            Exit
          </div>
      </div>
    </div>
  </>);
}

export default App;