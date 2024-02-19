import React from "react";

function App() {
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
          <div id="location" className="result">test</div>
          <div className="button" type="submit">Browse</div>
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