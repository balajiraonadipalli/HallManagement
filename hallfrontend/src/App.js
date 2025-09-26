import React from 'react'
import { AppProvider } from './AppContext'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import Routers from './Routes';

function App() {
  return (
   <>
  <BrowserRouter>
   <AppProvider>
    <Routers />
   </AppProvider>
  </BrowserRouter>
   
   </>
  )
}

export default App