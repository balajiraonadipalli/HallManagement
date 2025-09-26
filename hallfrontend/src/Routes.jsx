import React, { useEffect } from 'react'
import Form from './components/Form'
import { useAppContext } from './AppContext'
import {Routes,Route} from "react-router-dom"
import AddDeptHall from './components/AddDeptHall';
import EventList from './components/EventList';
import PendingList from './components/PendingLists';
import AvailbleHalls from './components/AvailableHalls';
import Login from './components/Login';
import AOS from 'aos';
function Routers() {
     useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration in ms
      once: true, // only animate once
    });
  }, []);
  return (
    <>
    <Routes >
      <Route path='/' element={<Form />}/>
      {/* <Route path='/Home' element={<Home />}/> */}
      <Route path='/Login' element={<Login />} />
      <Route path='/EventList' element={<EventList />}/>
      <Route path='/addDeptHall' element={<AddDeptHall />}/>
      <Route path='/Booking' element={<Form />}/>
      <Route path='/PendingList' element={<PendingList />}/>
       <Route path="/departments/name/:name/available-halls" element={<AvailbleHalls/>} />
    </Routes>
   
    </>
  )
}

export default Routers