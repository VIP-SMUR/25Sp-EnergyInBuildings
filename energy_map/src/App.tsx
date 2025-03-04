import React from 'react';
import MapView from '../components/MapView'; // Adjust path if needed
import ButtonComponent from '../components/ButtonComponent';

function App() {
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <MapView />
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <button type="button" id="hello-button">
          hello
        </button>
        <ButtonComponent />
      </div>
    </div>
  );
}

export default App;
