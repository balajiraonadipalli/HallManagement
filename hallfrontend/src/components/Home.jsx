// // import React from 'react'
// // import "./Home.css"
// // import Header from './Header'
// // const Home = () => {
// //   return (
// //     <div>
// //        <Header />
       

// //     </div>
// //   )
// // }

// // export default Home

// import React, { useState, useEffect } from 'react'
// import "./Home.css"
// import Header from './Header'
// import { useAppContext } from '../AppContext'
// import axios from 'axios'
// import { toast } from 'react-toastify'
// import { motion } from 'framer-motion'

// const Home = () => {
//   const { token } = useAppContext()
//   const [meetings, setMeetings] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selectedBuilding, setSelectedBuilding] = useState(null)
//   const {departments,
//         halls,} = useAppContext();
//   // Sample campus building data (replace with your actual campus layout)
//   // const departments = [
//   //   { id: 1, name: 'Main Hall', top: '25%', left: '30%', meetings: [] },
//   //   { id: 2, name: 'Science Block', top: '40%', left: '60%', meetings: [] },
//   //   { id: 3, name: 'Library', top: '60%', left: '20%', meetings: [] },
//   //   { id: 4, name: 'Administration', top: '15%', left: '70%', meetings: [] },
//   //   { id: 5, name: 'Student Center', top: '75%', left: '50%', meetings: [] },
//   // ]

//   useEffect(() => {
//     const fetchMeetings = async () => {
//       try {
//         const response = await axios.get('http://localhost:3900/bookings', {
//           headers: { authorization: `Bearer ${token}` }
//         })
        
//         // Group meetings by building
//         const updatedBuildings = departments.map(building => ({
//           ...building,
//           meetings: response.data.filter(meeting => meeting.hallName.includes(building.name))
//         }))
        
//         setMeetings(response.data)
//         setLoading(false)
//       } catch (error) {
//         toast.error('Failed to load meetings')
//         setLoading(false)
//       }
//     }

//     if (token) {
//       fetchMeetings()
//     }
//   }, [token])

//   return (
//     <div className="home-container">
//       <Header />
      
//       <div className="campus-view">
//         <h2 className="campus-title">Today's Campus Meetings</h2>
        
//         {loading ? (
//           <div className="loader">
//             <motion.div
//               className="spinner"
//               animate={{ rotate: 360 }}
//               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//             />
//             <p>Loading meetings...</p>
//           </div>
//         ) : (
//           <>
//             <div className="campus-map">
//               {/* Campus map background (replace with your actual campus map image) */}
//               <div className="map-background">
//                 {departments.map(building => (
//                   <motion.div
//                     key={building.id}
//                     className={`building ${selectedBuilding?.id === building.id ? 'active' : ''}`}
//                     style={{ top: building.top, left: building.left }}
//                     initial={{ scale: 1 }}
//                     whileHover={{ scale: 1.1 }}
//                     onClick={() => setSelectedBuilding(building)}
//                   >
//                     <div className="building-icon">
                      
//                     </div>
//                     <div className="building-name">{building.name}</div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>

//             <div className="meetings-panel">
//               <h3>
//                 {selectedBuilding 
//                   ? `Meetings in ${selectedBuilding.name}` 
//                   : 'Select a building to view meetings'}
//               </h3>
              
//               {selectedBuilding && (
//                 <div className="meetings-list">
//                   {selectedBuilding.meetings.length > 0 ? (
//                     selectedBuilding.meetings.map(meeting => (
//                       <motion.div 
//                         key={meeting._id}
//                         className="meeting-card"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <div className="meeting-header">
//                           <h4>{meeting.MeetingDescription}</h4>
//                           <span className="meeting-time">
//                             {new Date(meeting.startTime).toLocaleTimeString()} - 
//                             {new Date(meeting.endTime).toLocaleTimeString()}
//                           </span>
//                         </div>
//                         <div className="meeting-details">
//                           <p><strong>Organizer:</strong> {meeting.name}</p>
//                           <p><strong>Department:</strong> {meeting.Department}</p>
//                           <p><strong>Hall:</strong> {meeting.hallName}</p>
//                         </div>
//                       </motion.div>
//                     ))
//                   ) : (
//                     <p className="no-meetings">No meetings scheduled in this building</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Home