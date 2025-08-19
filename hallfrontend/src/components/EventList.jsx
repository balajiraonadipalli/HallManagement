// import React, { useEffect, useState } from 'react';
// import Header from './Header';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import './EventList.css';
// import { motion } from "framer-motion";

// const EventList = () => {
//   const today = new Date().toISOString().split("T")[0];
//   const [selectedDate, setSelectedDate] = useState(today);
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBookingsByDate = async () => {
//       try {
//         const res = await axios.post("http://localhost:3900/getallbookings", {
//           date: selectedDate
//         });
//         if (res.status === 200) {
//           toast.success("Fetched successfully");
//           setData(res.data);
//           console.log(res.data);
//         } else {
//           toast.error("Failed to fetch data");
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         toast.error("Error fetching bookings");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookingsByDate();
//   }, [selectedDate]);

//   return (
//     <>
//       <Header />
//       <div className='EventListPage'>
//         <div className='dat'>
//           <h3>Select the date:</h3>
//           <input
//             type='date'
//             name='date'
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//           />
//         </div>

//         {loading ? (
//           <div className="loader-container">
//             <motion.div
//               className="spinner"
//               animate={{ rotate: 360 }}
//               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//             />
//             <p>Loading...</p>
//           </div>
//         ) : (
//           <div className='bookingCardsCont'>
//             {Array.isArray(data) && data.length > 0 ? (
//               <div>
//                 {data.map((booking) => (
//                   <div key={booking._id} className='bookingCards' data-aos="fade-right">
//                     <b>
//                       {booking.name}
//                     </b>
//                     <p>
//                       {booking.bookingDate.split("T")[0]}
//                     </p>
//                     <b> startTime : {booking.startTime}-------</b>

//                     <b>EndTime : {booking.endTime}</b><br /><br />
//                     <b>Meeting Description:{booking.MeetingDescription}</b>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p>No bookings found for selected date</p>
//             )}
//           </div>
//         )}
//       </div>
//       {/* <ToastContainer /> */}
//     </>
//   );
// };

// export default EventList;
import React, { useEffect, useState } from 'react';
import Header from './Header';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import './EventList.css';
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiUser, FiInfo, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAppContext } from '../AppContext';
import Departments from './Departments';

const EventList = () => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPastDates, setShowPastDates] = useState(false);
  const {halls,token,ip} = useAppContext();
  
  // Function to navigate dates
  const navigateDate = (direction) => {
    const date = new Date(selectedDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      if (!showPastDates && date.toISOString().split("T")[0] >= todayString) {
        date.setDate(date.getDate() + 1);
      } else if (showPastDates) {
        date.setDate(date.getDate() + 1);
      }
    }
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  
    useEffect(() => {
    const fetchBookingsByDate = async () => {
      try {
        setLoading(true);
        setError(null);
        if(token){
           const res = await axios.post(`${ip}/getallbookings`,{
          // const res = await axios.post("http://localhost:3900/getallbookings", {
          date: selectedDate
        },{
          headers:{
            authorization:`Bearer ${token}`
          }
        });
        if (res.status === 200) {
          setData(res.data);
        } else {
          throw new Error("Failed to fetch data");
        }
        }else{
          // const res = await axios.get("http://localhost:3900/getallbookings", {
          const res = await axios.get(`${ip}/getallbookings`,{
          date: selectedDate
        });
        if (res.status === 200) {
          setData(res.data);
        } else {
          throw new Error("Failed to fetch data");
        }
        }
        
      } catch (error) {
        console.error("Error:", error);
        setError("Error fetching bookings. Please try again.");
        toast.error("Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsByDate();
  }, [selectedDate]);

  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  const isPastDate = (dateString) => {
    return new Date(dateString) < new Date(todayString);
  };

  return (
    <>
      {/* <Header /> */}
      <div className='EventListPage'>
        <div className='date-selector-container'>
          <h2 className='section-title'>Meeting Schedule</h2>
          <div className='date-navigation-controls'>
            <button
              onClick={() => navigateDate('prev')}
              className="nav-button"
              disabled={!showPastDates && new Date(selectedDate) <= new Date(todayString)}
              aria-label="Previous day"
            >
            <FiChevronLeft />
            </button>
            <div className='date-selector'>
              <FiCalendar className='date-icon' />
              <input
                type='date'
                name='date'
                value={selectedDate}
                onChange={(e) => {
                  const selected = new Date(e.target.value);
                  const today = new Date(todayString);
                  if (selected >= today || showPastDates) {
                    setSelectedDate(e.target.value);
                  } else {
                    toast.info("Enable 'Show Past Dates' to view historical bookings");
                  }
                }}
                className='date-input'
                min={showPastDates ? undefined : todayString}
              />
            </div>

            <button
              onClick={() => navigateDate('next')}
              className="nav-button"
              aria-label="Next day"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="past-dates-toggle">
            <label>
              <input
                type="checkbox"
                checked={showPastDates}
                onChange={() => setShowPastDates(!showPastDates)}
              />
              Show Past Dates
            </label>
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <motion.div
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <p>Loading meetings...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className='booking-container'>
            {Array.isArray(data) && data.length > 0 ? (
              <motion.div
                className="booking-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {data.map((booking) => (
                  <motion.div
                    key={booking._id}
                    className={`booking-card ${isPastDate(booking.bookingDate) ? 'past-booking' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="booking-card-header">
                      <FiUser className="booking-icon" />
                      <h3 className="booking-name">{booking.name}</h3>
                      {isPastDate(booking.bookingDate) && (
                        <span className="past-badge">Completed</span>
                      )}
                    </div>

                    <div className="booking-time">
                      <FiClock className="time-icon" />
                      <span className="time-range">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>

                    <div className="booking-date">
                      <FiCalendar className="date-icon-small" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>

                    {booking.MeetingDescription && (
                      <div className="booking-description">
                        <FiInfo className="info-icon" />
                        <p>{booking.MeetingDescription}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="no-bookings">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                  alt="No meetings"
                  className="empty-state-image"
                />
                <h3>No meetings scheduled for this date</h3>
                <p>Try selecting a different date or schedule a new meeting</p>
              </div>
            )}
          </div>
        )}
        <Departments />
      </div>
      
      {/* <ToastContainer position="bottom-right" autoClose={3000} /> */}
    </>
  );
};

export default EventList;