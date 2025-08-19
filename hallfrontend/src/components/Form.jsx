
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import "./Form.css";
import { motion } from "framer-motion";
import Header from './Header';
import Departments from './Departments';
import EventList from './EventList';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function Form() {
    const { name } = useAppContext();
    const [FilteredHalls, setFilteredHalls] = useState([]);
    const [dateError, setDateError] = useState("");

    const [bookingType, setBookingType] = useState("single");

    const initialFormState = {
        name: "",
        email: "",
        Department: "",
        MeetingDescription: "",
        hallName: "",
        bookingDate: "",
        toDate: "",
        startTime: "",
        endTime: "",
    };
    const [loading, setLoading] = useState(false);
    const { token } = useAppContext();
    const [formData, setFormData] = useState(initialFormState);
    const { departments, halls,bookings,ip } = useAppContext();
    const [blockedDates, setBlockedDates] = useState([]);

    const validateDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part to compare dates only
        const selectedDate = new Date(date);
        if (selectedDate < today) {
            setDateError("Booking date cannot be in the past");
            return false;
        }
        setDateError("");
        return true;
    };

    const HandleSubmit = async (e) => {
        e.preventDefault();
        // Validate date before submission
        if (!validateDate(formData.bookingDate)) {
            toast.error("Please select a valid future date");
            return;
        }
        setLoading(true);
        if (token) {
            try {
                console.log(formData);

                // const res = await axios.post("http://localhost:3900/bookings", {
                const res = await axios.post(`${ip}/bookings`, {
                    formData
                }, {
                    headers: {
                        authorization: `Bearer ${token}`,
                    }
                });
                if (res.status == 200 || res.status === 201) {
                    toast.success("Booking status will be sent to your email");
                    setFormData(initialFormState);
                } else {
                    toast.success(res.data);
                }
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    toast.error("The slots are already occupied");
                } else {
                    toast.error("Error in booking: " + (error.response?.data?.error || error.message));
                }
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Please Login");
        }
    }
    const HandleChange = (e) => {
        const { name, value } = e.target;

        // Check if the selected date is blocked
        if (name === "bookingDate" || name === "fromDate" || name === "toDate") {
            if (blockedDates.includes(value)) {
                setDateError(`The selected date (${value}) is unavailable.`);
                return; // Stop state update
            } else {
                setDateError(""); // Clear error if valid
            }
        }

      //  Handle department change and hall filtering
        if (name === "Department") {
            const hallsDept = halls.filter(h => h.department == value);
            setFilteredHalls(hallsDept);
            setFormData(prev => ({ ...prev, hallName: '' }));
        }
        
        if (name === "Department") {
    setFormData((prev) => ({
      ...prev,
      Department: value,
      hallName: "", // reset hall if needed
    }));

    const dept = departments.find((d) => d._id === value);
    if (dept) {
      const deptName = dept.DeptName;
      if (bookings[deptName]) {
        const dates = bookings[deptName].map((date) => new Date(date));
        setBlockedDates(dates);
      } else {
        setBlockedDates([]);
      }
    }
}
        // Update form data
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    return (
        <>
            <Header />
            {/* <ToastContainer position="bottom-right" autoClose={3000} /> */}
            {loading ? (
                <div className="loader-container">
                    <motion.div
                        className="spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    <div className='BookingPage' draggable="false">
                        <form onSubmit={HandleSubmit} className='form'>
                            <div className="form-header">
                                <h2>Book a Meeting Hall</h2>
                                <p>Fill in the details to reserve your meeting space</p>
                            </div>
                            <div className="inputsform">
                                <label>Name:</label>
                                <input type="text" className='name' name="name" required value={formData.name} onChange={HandleChange} />
                            </div>
                            <div className="inputsform">
                                <label>Email ref:</label>
                                <input type="email" className='emailform' name="email" required value={formData.email} onChange={HandleChange} />
                            </div>
                            <div className="inputsform">
                                <label>Booking Type:</label>
                                <select
                                    value={bookingType}
                                    onChange={(e) => {
                                        setBookingType(e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            bookingDate: "",
                                            fromDate: "",
                                            toDate: ""
                                        }));
                                    }}
                                >
                                    <option value="single">Single Day</option>
                                    <option value="bulk">Bulk Dates</option>
                                </select>
                            </div>


                            <div className="inputsform">
                                <label>Department</label>
                                <select required onChange={HandleChange} name='Department' className='department' value={formData.Department}>
                                    <option value="">---select Department---</option>
                                    {departments.map((dept) => (
                                        <option key={dept._id} value={dept._id}>
                                            {dept.DeptName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="inputsform">
                                <label>Hall Name:</label>
                                <select name="hallName" className='hallname' onChange={HandleChange} required value={formData.hallName}>
                                    <option value="">---select Hall---</option>
                                    {FilteredHalls.map((hall) => (
                                        <option key={hall._id} value={hall.hallName}>
                                            {hall.hallName} (Capacity: {hall.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* <div className="inputsform">
                                <label>Booking Date:</label>
                                <input
                                    type="date"
                                    className='date'
                                    name="bookingDate"
                                    required
                                    value={formData.bookingDate}
                                    onChange={HandleChange}
                                    min={new Date().toISOString().split('T')[0]} // Set min date to today
                                />
                                {dateError && <p className="error-message">{dateError}</p>}
                            </div> */}
                            {bookingType === "single" ? (
                                // <div className="inputsform">
                                //     <label>Booking Date:</label>
                                //     <input
                                //         type="date"
                                //         name="bookingDate"
                                //         className="date"
                                //         required
                                //         value={formData.bookingDate}
                                //         onChange={HandleChange}
                                //         min={new Date().toISOString().split("T")[0]}
                                //     />
                                //     {dateError && <p className="error-message">{dateError}</p>}
                                // </div>
                                <>
                                    
                                    <div className="inputsform">
                                        <label>Pick the Date:</label>
                                        <DatePicker
                                        selected={formData.bookingDate ? new Date(formData.bookingDate) : null}
                                        onChange={(date) => {
                                            const iso = date.toISOString().split("T")[0];
                                            setFormData(prev => ({ ...prev, bookingDate: iso }));
                                            setDateError(""); // clear errors
                                        }}
                                        // excludeDates={blockedDates}
                                         excludeDates={blockedDates.map(date => new Date(date))}
                                        minDate={new Date()}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select a booking date"
                                    />
                                    </div>
                                </>

                            ) : (
                                // <>
                                //     <div className="inputsform">
                                //         <label>From Date:</label>
                                //         <input
                                //             type="date"
                                //             name="fromDate"
                                //             className="date"
                                //             required
                                //             value={formData.fromDate}
                                //             onChange={HandleChange}
                                //             min={new Date().toISOString().split("T")[0]}
                                //         />
                                //     </div>
                                //     <div className="inputsform">
                                //         <label>To Date:</label>
                                //         <input
                                //             type="date"
                                //             name="toDate"
                                //             className="date"
                                //             required
                                //             value={formData.toDate}
                                //             onChange={HandleChange}
                                //             min={formData.fromDate || new Date().toISOString().split("T")[0]}
                                //         />
                                //     </div>
                                // </>
                                <>
                                    <div className='DatesPick'>
                                        <div className="inputsform">
                                        <label>From Date:</label>
                                        <DatePicker
                                            selected={formData.fromDate ? new Date(formData.fromDate) : null}
                                            onChange={(date) => {
                                                const iso = date.toISOString().split("T")[0];
                                                setFormData(prev => ({ ...prev, fromDate: iso }));
                                                setDateError(""); // clear errors
                                            }}
                                            excludeDates={blockedDates.map(date => new Date(date))}
                                            minDate={new Date()}
                                            dateFormat="yyyy-MM-dd"
                                            placeholderText="Select start date"
                                        />
                                        {dateError && <p className="error-message">{dateError}</p>}
                                        
                                    </div>

                                    <div className="inputsform">
                                        <label>To Date:</label>
                                        <DatePicker
                                            selected={formData.toDate ? new Date(formData.toDate) : null}
                                            onChange={(date) => {
                                                const iso = date.toISOString().split("T")[0];
                                                setFormData(prev => ({ ...prev, toDate: iso }));
                                                setDateError(""); // clear errors
                                            }}
                                            excludeDates={blockedDates.map(date => new Date(date))}
                                            minDate={formData.fromDate ? new Date(formData.fromDate) : new Date()}
                                            dateFormat="yyyy-MM-dd"
                                            placeholderText="Select end date"
                                        />
                                        {dateError && <p className="error-message">{dateError}</p>}
                                    </div>
                                    </div>
                                </>

                            )}

                            <div className="inputsform">
                                <label>Start Time:</label>
                                <input type="time" className='starttime' name="startTime" required value={formData.startTime} onChange={HandleChange} />
                            </div>
                            <div className="inputsform">
                                <label>End Time:</label>
                                <input type="time" className='endtime' name="endTime" required value={formData.endTime} onChange={HandleChange} />
                            </div>
                            <div className="inputsform">
                                <label>Meeting Description:</label>
                                <textarea className='description' name="MeetingDescription" required value={formData.MeetingDescription} onChange={HandleChange} />
                            </div>

                            <div className='button'>
                                <motion.button
                                    whileTap={{
                                        scale: 1.1,
                                        backgroundColor: "#059669"
                                    }}
                                    type="submit"
                                    disabled={dateError}

                                >
                                    Submit Booking
                                </motion.button>
                            </div>
                        </form>
                        <EventList />

                    </div>

                </>
            )}
        </>
    )
}

export default Form;