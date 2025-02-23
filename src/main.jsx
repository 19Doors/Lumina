import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {App} from './App.jsx'
import SearchBox from './SearchBox.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchBox />
  </StrictMode>,
)
