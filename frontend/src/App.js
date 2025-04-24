// App.js
import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import "./App.css";
import particlesOptions from "./particles.json";
import SearchBar from "./tools/SearchBar"; // Import the SearchBar component

function App() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (init) return;
    // Initialize tsParticles engine
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, [init]);

  return (
    <div className="App">
      {init && <Particles options={particlesOptions} />}
      <header className="App-header">
        <div className="App-text">
          <h1>M.A.R.K.</h1>
          <h2>Music Analytics & Recommendation Knowledge-graph</h2>
        </div>

        <div className="Search-container">
          <SearchBar />
        </div>
      </header>
    </div>
  );
}

export default App;
