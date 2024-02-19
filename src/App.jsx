import React from "react";
import { useState, useEffect, useRef } from "react";

function App() {
  const [paths, setpaths] = useState([,,null]);
  const pathRef = useRef();
  pathRef.current = paths;

  const returnPaths= async function() {
    const result=await window.electron.folderPathsGet();
    setpaths(result);
    console.log( "***** pathRef.current[2]="+pathRef.current[2]);
  }
  const dirPathGet= async function() {  
    const result=await window.electron.directorySelect();
    if(result){
      setpaths(result);
    }
    console.log("does it exist?"+paths[2]);
  }

  useEffect(()=>{
    returnPaths();
  }, []);

  return (<>
    <div className="bg-abt-blue-dark text-white text-xs">
      <div className="container select-none">
      Update or Install the ETMR Optimizer
      </div>
    </div>
    <div className="container text-base">
      <div>
      Select the location for the ETMR Optimizer
      </div>
      <div className="float-left">
        <div className="browse-container flex-container">
          <div id="location" className="result">{pathRef.current[1]}</div>
          <div className="button" onClick={()=>dirPathGet()} >Browse</div>
        </div>
      </div>
        <div className="coral-button select-none install-btn">
          Install 
        </div>
        <div className="coral-button select-none cancel-btn">
          Cancel
        </div>
    </div>
  </>);
}

export default App;