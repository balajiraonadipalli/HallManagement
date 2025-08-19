
import React, { useEffect, useState } from 'react';
import Header from './Header';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import './AvailableHalls.css';
import { useParams } from 'react-router-dom';
import { motion } from "framer-motion";
import {
    FaChalkboardTeacher,
    FaBuilding,
    FaCalendarAlt,
    FaClock,
    FaInfoCircle,
    FaCalendarDay,
    FaAlignLeft, FaCalendarTimes, FaSync
} from "react-icons/fa";
import { useAppContext } from '../AppContext';

const AvailableHalls = () => {
    const { name } = useParams();
    const [data, setData] = useState([]);
    const today = new Date().toISOString().split("T")[0];
    const startTime = "10:00";
    const endTime = "12:00";
    const [loading, setLoading] = useState(true);
    const { halls,ip } = useAppContext();
    const getHallName = (hallId) => {
        const matched = halls.find(h => h._id === hallId);
        return matched ? matched.hallName : 'Unknown Hall';
    };


    useEffect(() => {
        const fetchAvailableHalls = async () => {
            try {
                // const res = await axios.get(
                //     `http://localhost:3900/departments/name/${name}/available-halls`,
                 const res = await axios.get(
                    `${ip}/departments/name/${name}/available-halls`,
                    {
                        params: {
                            date: today,
                        }
                    }
                );
                if (res.status === 200) {
                    toast.success("Fetched successfully");
                    setData(res.data);
                    console.log(res.data);
                } else {
                    toast.error("Failed to fetch data");
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error fetching bookings");
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableHalls();
    }, []);
    const animationProps = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };
    return (
        <>
            <Header />

            {loading ? (
                <div className="loader-container">
                    <motion.div
                        className="spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <p>Loading future meetings...</p>
                </div>
            ) : (
                <div className="available-halls-page">
                    {/* Header */}
                    <motion.div className="page-header" {...animationProps}>
                        <h2 className="section-title">
                            <FaChalkboardTeacher className="title-icon" style={{ color: '#FF6B6B' }} />
                            Upcoming Meetings
                        </h2>
                    </motion.div>

                    {/* Cards Container */}
                    <div className="halls-container">
                        {Array.isArray(data) && data.length > 0 ? (
                            data.map((booking, index) => (
                                <motion.div
                                    key={booking._id || index}
                                    className="hall-card"
                                    whileHover={{ scale: 1.02 }}
                                    {...animationProps}
                                >
                                    {/* Card Header with Hall Name */}
                                    <div className="hall-header">
                                        <h3 className="hall-name">
                                            <FaBuilding style={{ color: '#4ECDC4' }} />
                                            {booking.name || `Hall ${booking.hall}`}
                                        </h3><h3>{getHallName(booking.hall)}</h3>
                                    </div>

                                    {/* Card Content */}
                                    <div className="hall-content">
                                        <h4 className="meeting-title">
                                            <FaCalendarDay style={{ color: '#FF9F1C', marginRight: '8px' }} />
                                            {booking.name}
                                        </h4>
                                        <p className="meeting-description">
                                            <FaAlignLeft style={{ color: '#6A0572', marginRight: '8px' }} />
                                            {booking.MeetingDescription}
                                        </p>

                                        {/* Meeting Details */}
                                        <div className="meeting-meta">
                                            <span className="meta-item">
                                                <FaCalendarAlt style={{ color: '#2EC4B6' }} />
                                                {new Date(booking.bookingDate).toLocaleDateString()}
                                            </span>
                                            <span className="meta-item">
                                                <FaClock style={{ color: '#E71D36' }} />
                                                {booking.startTime} - {booking.endTime}
                                            </span>
                                            <span className="meta-item">
                                                <FaInfoCircle style={{ color: '#FF9F1C' }} />
                                                Status: <span style={{
                                                    color: booking.status === 'confirmed' ? '#2EC4B6' :
                                                        booking.status === 'pending' ? '#FF9F1C' : '#E71D36',
                                                    fontWeight: 'bold'
                                                }}>{booking.status}</span>
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                className="no-meetings-container"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="no-meetings-content">
                                    <FaCalendarTimes className="no-meetings-icon" style={{ color: '#bdc3c7', fontSize: '4rem' }} />
                                    <h3>No Meetings Scheduled</h3>
                                    <p>There are currently no upcoming meetings</p>
                                    <button className="refresh-button">
                                        <FaSync style={{ marginRight: '8px' }} />
                                        Refresh
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AvailableHalls;
