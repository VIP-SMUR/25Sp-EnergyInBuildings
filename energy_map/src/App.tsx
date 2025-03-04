import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView'; // Adjust path if needed
import ButtonComponent from '../components/ButtonComponent';

function App() {
  // Store building height state here so it doesn't cause re-renders of MapView
  const [buildingHeight, setBuildingHeight] = useState<number | null>(null);

  useEffect(() => {
    // Ensure App is rendered properly when buildingHeight is updated
    if (buildingHeight !== null) {
      console.log(`Building Height: ${buildingHeight} meters`);
    }
  }, [buildingHeight]);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* Pass the setBuildingHeight function to update state from MapView */}
      <MapView setBuildingHeight={setBuildingHeight} />

      {/* UI Elements */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <button type="button" id="hello-button">
          predict
        </button>
        {/* Pass the buildingHeight to ButtonComponent so it uses the correct value */}
        <ButtonComponent buildingHeight={buildingHeight} />
      </div>
    </div>
  );
}

export default App;
