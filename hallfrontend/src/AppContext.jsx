import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useContext, createContext } from 'react'
import { useNavigate } from 'react-router-dom';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    // const [departments,setDepartments] = useState([
    //     { _id: "d1", name: "CSE" },
    //     { _id: "d2", name: "ECE" }
    // ])
    const [departments, setDepartments] = useState([]);
    const ip = "http://localhost:3900"
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await axios.get(`${ip}/fetchDepts`);
                if (res.status == 200) {
                    setDepartments(res.data.fetchDepts);
                }
                console.log(res.data.fetchDepts)

            } catch (error) {
                console.log(error);
            }
        }
        fetchDepts();
    }, []);
    // const [halls,setHalls] = useState([
    //     { _id: "h1", hallName: "panini", deptname: "CSE" },
    //     { _id: "h2", hallName: "LEE LAB", deptname: "CSE" },
    //     { _id: "h3", hallName: "thomsan LAB", deptname: "ECE" },
    //     { _id: "h4", hallName: "charan LAB", deptname: "ECE" },
    // ]);
    const [halls, setHalls] = useState([]);
    useEffect(() => {

        const fetchHalls = async () => {
            try {
                 const res = await axios.get(`${ip}/fetchHalls`);
                // const res = await axios.get("http://localhost:3900/fetchHalls");
                if (res.status == 200) {
                    setHalls(res.data.fetchHalls)
                }
                console.log(res.data.fetchHalls);
            } catch (error) {
                console.log(error);
            }
        }
        fetchHalls();

    }, []);
    const [bookings, setBookings] = useState([]);
    useEffect(() => {
    const fetchFilteredBookings = async () => {
      try {
         const res = await axios.get(`${ip}/bookings/fully-occupied`);
        // const res = await axios.get("http://localhost:3900/bookings/fully-occupied");
        setBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } 
    };

    fetchFilteredBookings();
  }, []);
  console.log(bookings);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
     const [adm, setAdm] =  useState(() => localStorage.getItem("adm"));
    const value = {
        departments,
        setDepartments,
        halls,
        setHalls,
        token, setToken, adm,
        setAdm,
        bookings,ip
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

const useAppContext = () => {
    return useContext(AppContext)
}

export { AppProvider, useAppContext }