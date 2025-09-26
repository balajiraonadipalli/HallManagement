import React, { useEffect } from 'react'
import "./Departments.css"
import { motion } from "framer-motion"
import { Link } from 'react-router-dom'
import { useAppContext } from '../AppContext'
import AOS from "aos";
import "aos/dist/aos.css";
const Departments = () => {
    const {departments} = useAppContext();
//     useEffect(()=>{
//         gsap.from(".departmentCard", {
//     x: -100,
//     duration: 1,
//     opacity: 0,  
//     ease: "power3.out",
//     stagger:.5
//   });
//     },[])
useEffect(() => {
  AOS.init({
    duration: 800,   
    once: true      
  });
}, []);

    return (
        <>
            <div>
                <h2 className='departheader'>
                    check out the empty slots in each Department
                </h2>
                <div className='Departments'>
                    {
                        departments.map((dept) => (
                            <Link
                                key={dept._id}
                                to={`/departments/name/${encodeURIComponent(dept.DeptName)}/available-halls`}
                                style={{ textDecoration: 'none' }}
                                state={{ departName: dept.DeptName }}
                            >
                                <motion.div
                                    whileTap={{
                                        scale: 1.1,
                                        rotate: [0, 10, -10],
                                    }}
                                    // data-aos="fade-left"
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }}
                                    className="departmentCard" // optional class for styling
                                    style={{ padding: '10px', background: '#e0ffe0', marginBottom: '10px', borderRadius: '8px' }}
                                >
                                    {dept.DeptName}
                                </motion.div>
                            </Link>
                        ))
                    }

                </div>
            </div>
        </>
    )
}

export default Departments