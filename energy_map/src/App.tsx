import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ButtonComponent from '../components/ButtonComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <button type='button' id='hello-button'>hello</button>
      <ButtonComponent/>
    </>
  )
}

export default App
