import React, { useState, useEffect } from 'react';
import './App.css';
import { Editor } from './Editor';

interface AppProps {}

function App({}: AppProps) {
  return (
    <div className="App">
      <header className="App-header">
        <Editor />
      </header>
    </div>
  );
}

export default App;
