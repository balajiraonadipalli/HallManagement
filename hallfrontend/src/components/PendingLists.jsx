
import React, { useEffect, useState } from 'react';
import Header from './Header';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EventList.css';
import { motion } from "framer-motion";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAppContext } from '../AppContext';
import { FiClock, FiCalendar, FiHome, FiInfo, FiCheck, FiX, FiEdit } from 'react-icons/fi';

const PendingList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, halls,ip } = useAppContext();
  const [reasonText, setReasonText] = useState("");
  const [activeRejectId, setActiveRejectId] = useState(null);

  // Function to get hall details by hall ID (_id)
  const getHallDetails = (hallId) => {
    if (!halls || halls.length === 0) {
      return { 
        name: 'Loading halls...', 
        capacity: '?', 
        department: 'Loading...' 
      };
    }
    
    const hall = halls.find(h => h._id === hallId);
    if (!hall) {
      console.warn('Hall not found for ID:', hallId);
      console.log('Available halls:', halls);
      return { 
        name: 'Unknown Hall', 
        capacity: 'Unknown', 
        department: 'Unknown' 
      };
    }
    return {
      name: hall.hallName,
      capacity: hall.capacity,
      department: hall.department
    };
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const fetchPendingLists = async () => {
      try {
        setLoading(true);
        console.log("Fetching pending bookings...");
        const res = await axios.get(`${ip}/getpendings`,{
          headers:{
            authorization:`Bearer ${token}`
          }
        });
        if (res.status === 200) {
          setData(res.data.pendingList);
          console.log('Pending bookings:', res.data.pendingList);
          console.log('Available halls:', halls);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error fetching bookings", { toastId: 'fetch-error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLists();
  }, [halls, ip, token]);

  const HandleApprove = async (bookingId, status, reason = "") => {
    const toastId = toast.loading("Processing request...",);
    try {
      // const res = await axios.patch(
      //   `http://localhost:3900/bookings/${bookingId}/status`,
      const res = await axios.patch(
        `${ip}/bookings/${bookingId}/status`,
        { status, reason },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        toast.update(toastId, {
          render: res.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
          closeOnClick:true
        });
        setData(prev => prev.filter(item => item._id !== bookingId));
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to update status",
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        closeOnClick:true
      });
      console.error("Error updating status:", error);
    } finally {
      setActiveRejectId(null);
      setReasonText("");
    }
  };

  return (
    <>
      <Header />
      {/* <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
      
      {loading ? (
        <div className="loader-container">
          <motion.div
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p>Loading pending bookings...</p>
        </div>
      ) : (
        <div className="pending-container">
          <div className="pending-header">
            <h2>Pending Booking Requests</h2>
            <p className="pending-subtitle">Review and manage room booking requests</p>
          </div>
          
          {Array.isArray(data) && data.length > 0 ? (
            <div className="pending-grid">
              {data.map((pending, index) => {
                const hallDetails = getHallDetails(pending.hall); // Changed from pending.hallName to pending.hall
                return (
                  <motion.div
                    key={pending._id || index}
                    className="pending-card"
                    data-aos="fade-up"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="card-header">
                      <div className="hall-info">
                        <FiHome className="card-icon" />
                        <div>
                          <h3>{hallDetails.name}</h3>
                          <p className="hall-meta">
                            Capacity: {hallDetails.capacity} | 
                            Dept: {hallDetails.department}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${pending.status}`}>
                        {pending.status}
                      </span>
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-row">
                        <FiCalendar className="detail-icon" />
                        <span>{new Date(pending.bookingDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      
                      <div className="detail-row">
                        <FiClock className="detail-icon" />
                        <span>{pending.startTime} - {pending.endTime}</span>
                      </div>
                      
                      <div className="detail-row">
                        <FiInfo className="detail-icon" />
                        <p className="meeting-description">{pending.MeetingDescription}</p>
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      <motion.button
                        className="approve-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => HandleApprove(pending._id, "approved")}
                      >
                        <FiCheck /> Approve
                      </motion.button>
                      
                      <motion.button
                        className="reject-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveRejectId(pending._id)}
                      >
                        <FiX /> Reject
                      </motion.button>
                    </div>
                    
                    {activeRejectId === pending._id && (
                      <motion.div 
                        className="rejection-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="form-group">
                          <label>
                            <FiEdit /> Reason for rejection
                          </label>
                          <textarea
                            placeholder="Please provide a reason for rejecting this booking..."
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                          />
                        </div>
                        <button
                          className="submit-rejection"
                          onClick={() => {
                            if (!reasonText.trim()) {
                              toast.error("Please enter a reason for rejection.");
                              return;
                            }
                            HandleApprove(pending._id, "rejected", reasonText);
                          }}
                        >
                          Submit Rejection
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="no-pendings">
              <div className="empty-state">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No pending requests" />
                <h3>No pending booking requests</h3>
                <p>All booking requests have been processed</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PendingList;