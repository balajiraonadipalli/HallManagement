import React, { useEffect, useState } from 'react'
import Header from './Header';
import "./Login.css"
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';

const Login = () => {
     const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [login, setLogin] = useState(false);
    const [admin, setAdmin] = useState("user");
    const navigate = useNavigate();
    const { token, setToken,adm,setAdm,departments,ip } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [dept,setDept] = useState("");
    const Login = async () => {
        console.log(email + password + admin + username);
        setLoading(true);
        try {
            if (login) {
                try {
                    console.log("LOGIN")
                    // const res = await axios.post("http://localhost:3900/Login", {
                    const res = await axios.post(`${ip}/Login`, {
                        email,
                        password,
                        admin
                    });
                    if (res.status == 201) {
                        toast.success("Login succcssful")
                        localStorage.setItem("token", res.data.token)
                        localStorage.setItem("adm",res.data.existUser.role)
                        console.log(res.data);
                        setAdm(res.data.existUser.role)
                        console.log(res.data.token);
                        setToken(res.data.token);
                        navigate("/Booking")
                    }
                } catch (error) {
                    if (error.status == 400) {
                        toast.error("Invalid credentials")
                    } else {
                        toast.error(error)
                    }
                }finally{
                    setLoading(false);
                }
            } else {
                console.log("Register")
                console.log(dept)
                // const res = await axios.post("http://localhost:3900/register", {
                const res = await axios.post(`${ip}/register`, {
                    email,
                    password,
                    admin,
                    username,
                    department: dept,
                });
                if (res.status == 201) {
                    toast.success("Registered Succcesfully Login with your credentials")
                    localStorage.setItem("token", res.data.token)
                    console.log(res.data.token);
                    setToken(res.data.token);
                } else {
                    toast.error("Login Failed");
                    console.log(res.data);
                }
            }
        } catch (error) {
            toast.error(error);
        }finally{
            setLoading(false);
        }
    }
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
                    <p>Loading...</p>
                </div>
            ) : (
                <div className='login-page-container'>
                    <div className='login-card'>
                        <div className='auth-toggle'>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className={`toggle-btn ${!login ? 'active' : ''}`}
                                onClick={() => setLogin(false)}>
                                Sign Up
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                className={`toggle-btn ${login ? 'active' : ''}`}
                                onClick={() => setLogin(true)}>
                                Login
                            </motion.button>
                        </div>

                        <div className='login-content'>
                            {!login && (
                                <>
                                <div className='input-group'>
                                    <label>Username:</label>
                                    <input 
                                        type='text' 
                                        required 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        value={username} 
                                    />
                                </div>
                                 <div className="inputsform">
                    <label>Department</label>
                    <select
                      required
                      onChange={(e) => setDept(e.target.value)} 
                      name="Department"
                      className="department"
                      value={dept}
                    >
                      <option value="">---select Department---</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.DeptName}>
                          {dept.DeptName}
                        </option>
                      ))}
                    </select>
                  </div>
                                </>
                            )}

                            <div className='input-group'>
                                <label>Email:</label>
                                <input 
                                    type='email' 
                                    required 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    value={email} 
                                />
                            </div>

                            <div className='input-group'>
                                <label>Password:</label>
                                <input 
                                    type='password' 
                                    required 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    value={password} 
                                />
                            </div>
                            
                            <div className='role-selection'>
                                <label>Profile Type:</label>
                                <div className='radio-group'>
                                    <label className='radio-option'>
                                        <input 
                                            type='radio' 
                                            onChange={(e) => setAdmin(e.target.value)} 
                                            value="admin" 
                                            name="admin" 
                                        />
                                        <span className='radio-custom'></span>
                                        Admin
                                    </label>
                                    <label className='radio-option'>
                                        <input 
                                            type='radio' 
                                            onChange={(e) => setAdmin(e.target.value)} 
                                            value="user" 
                                            name="admin" 
                                            defaultChecked
                                        />
                                        <span className='radio-custom'></span>
                                        User
                                    </label>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='submit-btn'
                                onClick={Login}>
                                {login ? "Login" : "Register"}
                            </motion.button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </>
    )
}

export default Login;