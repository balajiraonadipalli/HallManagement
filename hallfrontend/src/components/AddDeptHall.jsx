

import React, { useState } from 'react'
import Header from './Header'
import "./AddDeptHall.css"
import { motion } from "framer-motion"
import { toast } from 'react-toastify'
import axios from "axios"
import { useAppContext } from '../AppContext'

const AddDeptHall = () => {
    // Separate states for each form
    const [deptForm, setDeptForm] = useState({
        DepartName: ""
    });
    
    const [hallForm, setHallForm] = useState({
        hallName: "",
        capacity: "",
        department: ""
    });
    
    const { departments, setDepartments,ip } = useAppContext();
    const [deptLoading, setDeptLoading] = useState(false);
    const [hallLoading, setHallLoading] = useState(false);

    const handleDept = async () => {
        setDeptLoading(true);
        try {
            console.log(hallForm)
            // const res = await axios.post("http://localhost:3900/addDept", {
            
            const res = await axios.post(`${ip}/addDept`,{
                DeptName: deptForm.DepartName,
            });
            
            if (res.status === 201) {
                toast.success("Department created successfully");
                // Update context only after successful API call
                setDepartments(prev => [
                    ...prev,
                    {
                        _id: `${prev.length + 1}`,
                        DeptName: deptForm.DepartName
                    }
                ]);
                // Clear form only after success
                setDeptForm({ DepartName: "" });
            }
        } catch (error) {
            if (error.response?.status === 400) {
                toast.warn("Department already present");
            } else {
                toast.error(error.message);
            }
        } finally {
            setDeptLoading(false);
        }
    }

    const HandleHall = async () => {
        setHallLoading(true);
        try {
            // const res = await axios.post("http://localhost:3900/addHall", {
            console.log(hallForm)
            const res = await axios.post(`${ip}/addHall`,{
                hallName: hallForm.hallName,
                capacity: hallForm.capacity,
                department: hallForm.department
            });
            
            if (res.status === 201) {
                toast.success("Hall created successfully");
                // Clear form only after success
                setHallForm({
                    hallName: "",
                    capacity: "",
                    department: ""
                });
            }
        } catch (error) {
            if (error.response?.status === 400) {
                toast.warn("Hall is already created");
            } else {
                toast.error(error.message);
            }
        } finally {
            setHallLoading(false);
        }
    }

    return (
        <>
            <Header />
            <div className='addcomponents'>
                {deptLoading ? (
                    <div className="loader-container">
                        <motion.div
                            className="spinner"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <p>Loading...</p>
                    </div>
                ) : (
                    <div className='addDept' data-aos="fade-right">
                        <div>
                            <label>Enter the Department name:</label>
                            <input 
                                type='text' 
                                name='DepartName' 
                                onChange={(e) => setDeptForm({ DepartName: e.target.value })}
                                value={deptForm.DepartName}
                            />
                        </div>
                        <div>
                            <motion.button 
                                whileTap={{ scale: 1.2 }}
                                transition={{ duration: .3 }}
                                onClick={handleDept}
                            >
                                Add Department
                            </motion.button>
                        </div>
                    </div>
                )}

                {hallLoading ? (
                    <div className="loader-container">
                        <motion.div
                            className="spinner"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <p>Loading...</p>
                    </div>
                ) : (
                    <div className='addHall' data-aos="fade-left">
                        <div>
                            <label>Enter the Hall name:</label>
                            <input 
                                type='text' 
                                name='hallName' 
                                onChange={(e) => setHallForm({ ...hallForm, hallName: e.target.value })}
                                value={hallForm.hallName}
                            />
                        </div>
                        {/* <div>
                            <label>Enter Department:</label>
                            <input 
                                type='text' 
                                name='department' 
                                onChange={(e) => setHallForm({ ...hallForm, department: e.target.value })}
                                value={hallForm.department}
                            />
                        </div> */}
                        <div className="inputsform">
                                <label>Department</label>
                                <select required  onChange={(e) => setHallForm({ ...hallForm, department: e.target.value })}
                                name='Department' className='department' value={hallForm.department} style={{marginLeft:"20px"}}>
                                    <option value="">---select Department---</option>
                                    {departments.map((dept) => (
                                        <option key={dept._id} value={dept.department}>
                                            {dept.DeptName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        <div>
                            <label>Enter the capacity:</label>
                            <input 
                                type='text' 
                                name='capacity' 
                                onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value })}
                                value={hallForm.capacity}
                            />
                        </div>
                        <div>
                            <motion.button 
                                whileTap={{ scale: 1.2 }}
                                transition={{ duration: .3 }}
                                onClick={HandleHall}
                            >
                                Add Hall
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
           
        </>
    )
}

export default AddDeptHall