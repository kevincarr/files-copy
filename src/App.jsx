import React from "react";
import { useState, useEffect, useRef } from "react";

function App() {
  const [paths, setpaths] = useState([,,null]);
  const pathRef = useRef();
  pathRef.current = paths;

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

  const isInstalled=()=>{
    if(pathRef.current[2]){
      return(<>
        <div>
          An ETMR Optimizer has been detected, choose "Update" to update or fix this version.
        </div><br/>
      </>);
    }
  }
  const updateFiles = async function(){
    let myTo=pathRef.current[1];
    let myFrom=pathRef.current[0].split(".webpack")[0];
    if(myFrom.slice(-1)==="\\"){

      myFrom=myFrom.slice(0, -1);
    }
    myFrom=myFrom+"\\files-to-copy";

    if(myTo.slice(-1)==="\\"){
      myTo=myTo.slice(0, -1);
    }
    myTo=myTo+"\\files-to-copy";
    
    console.log("***** myFrom="+myFrom);
    console.log("***** myTo"+myTo);
    let result=await window.electron.copyFolderSync(myFrom,myTo);

    //const result=await window.electron.copyFolderSync();
  }

  const updateOrInstall=()=>{
    if(pathRef.current[2]){
      return(<div className="coral-button select-none install-btn" onClick={()=>updateFiles()}>
        Update 
      </div>);
    } else {
      return(<div className="coral-button select-none install-btn" onClick={()=>updateFiles()}>
        Install 
      </div>);
    }
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
        {updateOrInstall()}
        <div className="coral-button select-none cancel-btn">
          Cancel
        </div>
    </div>
  </>);
}

export default App;