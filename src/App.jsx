import React from "react";
import { useState, useEffect, useRef } from "react";

function App() {
  const [paths, setpaths] = useState([,,null]);
  const pathRef = useRef();
  pathRef.current = paths;

  const returnPaths= async function() {
    const result=await window.electron.folderPathsGet();
    setpaths(result);
  }
  const dirPathGet= async function() {  
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
  const updateOrInstall=()=>{
    if(pathRef.current[2]){
      return(<div className="coral-button select-none install-btn">
        Update 
      </div>);
    } else {
      return(<div className="coral-button select-none install-btn">
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