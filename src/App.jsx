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
    const result=await window.electron.directorySelect();
    if(result){
      setpaths(result);
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
  
  const filesInstall = async function(){
    let myTo=pathRef.current[1];
    let myFrom=pathRef.current[0].split(".webpack")[0];
    if(myFrom.slice(-1)===PATH_DELIMTER){

      myFrom=myFrom.slice(0, -1);
    }
    myFrom=myFrom+PATH_DELIMTER+"copyFolderSync";
    const myFromRoot=myFrom;
    console.log("***** myFromRoot="+myFromRoot);

    if(myTo.slice(-1)===PATH_DELIMTER){
      myTo=myTo.slice(0, -1);
    }
    const myToRoot=myTo;
    console.log("***** myToRoot"+myToRoot);
    //myTo=myTo+PATH_DELIMTER+"copyFolderSync";
    //console.log("***** myTo"+myTo);
    console.log("***** ***** ***** ***** *****");
    let result=await window.electron.makeFolderSync(myTo);
    setProgress("10%");
    myTo=myTo+PATH_DELIMTER+"app-1.0.0";
    myFrom=myFrom+PATH_DELIMTER+"app-1.0.0"; 
    result=await await window.electron.copyFolderSync(myFrom,myTo);
    setProgress("20%");
    //const result=await window.electron.copyFolderSync();
  }

  const updateOrInstall=()=>{
    if(pathRef.current[2]){
      return(<div className="coral-button select-none install-btn" onClick={()=>filesUpdate()}>
        Update 
      </div>);
    } else {
      return(<div className="coral-button select-none install-btn" onClick={()=>filesInstall()}>
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
          <div className="button" onClick={()=>dirPathGet()} >Browse</div>
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