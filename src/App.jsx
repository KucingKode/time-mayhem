import React, { useEffect, useRef } from 'react'
import './App.css'
import game from './game'

function App() {
  const canvasRef = useRef()

  useEffect(() => {
    canvasRef.current.appendChild(game.canvas)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={canvasRef} />
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
      <div style={{fontFamily: 'vt323', position: 'absolute', left: '-1000px', visibility: 'hidden'}}>.</div>
      </div>
    </div>
  )
}

export default App
