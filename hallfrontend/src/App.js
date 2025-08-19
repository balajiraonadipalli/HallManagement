import React from 'react'
import Routes from './Routes'
import { AppProvider } from './AppContext'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter } from 'react-router-dom';
import Routers from './Routes';
import Header from './components/Header';

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