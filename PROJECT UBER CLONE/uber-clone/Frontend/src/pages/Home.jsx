import React, { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import axios from 'axios';
import { useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [pickup, setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [vehicleType, setVehicleType] = useState(null)
    const [panelOpen, setPanelOpen] = useState(false)
    const [activeField, setActiveField] = useState(null) // 'pickup' or 'destination'
    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)


    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)
    const [vehiclePanel, setVehiclePanel] = useState(false)
    const [confirmRidePanel, setConfirmRidePanel] = useState(false)

    const [vehicleFound, setVehicleFound] = useState(false)
    const [waitingForDriver, setWaitingForDriver] = useState(false)

    const [formError, setFormError] = useState('')
    const [fare, setFare] = useState({})
    const [ride, setRide] = useState(null)

    const navigate = useNavigate()
    const { socket } = useContext(SocketContext)
    const { user, setUser, setIsLoading, setError } = useContext(UserDataContext)


    useEffect(() => {
        const fetchUserProfile = async () => {

            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/profile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setUser(res.data);
        };

        fetchUserProfile();
    }, []);



    useEffect(() => {
        if (!user || !user._id) return;
        socket.emit("join", { userType: "user", userId: user._id })
        console.log("User joined with ID:", user._id)
    }, [user])

    // socket.on('ride-confirmed', ride => {


    //     setVehicleFound(false)
    //     setWaitingForDriver(true)
    //     setRide(ride)
    // })

    // socket.on('ride-started', ride => {
    //     console.log("ride")
    //     setWaitingForDriver(false)
    //     navigate('/riding', { state: { ride } }) // Updated navigate to include ride data
    // })
    const submitHandler = (e) => {
        e.preventDefault()
    }

    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
                // opacity:1
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
                // opacity:0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [panelOpen])

    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [vehiclePanel])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [confirmRidePanel])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [vehicleFound])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [waitingForDriver])

    async function findTrip() {
        if (!pickup.trim() || !destination.trim()) {
            setFormError('Please fill both pickup and destination fields.');
            return;
        }
        setFormError('');
        setPanelOpen(false);
        setVehiclePanel(true);
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/ride/get-fare`, {
            params: { pickup, destination },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setFare(response.data.fare);
    }

    async function createRide() {
        if (!pickup.trim() || !destination.trim()) {
            setFormError('Please fill all fields.');
            return;
        }
        setFormError('');
        setPanelOpen(false);
        setVehiclePanel(false);
        setConfirmRidePanel(true);

        // Call API to create ride
        try {
            console.log({ pickup, destination, vehicleType });
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/ride/create`, {
                pickup,
                destination,
                vehicleType
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error creating ride:', error);
            setFormError('Failed to create ride. Please try again.');
        }
    }

    return (
        <div className='h-screen relative overflow-hidden'>
            <img className='w-16 absolute left-5 top-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
            <div className='h-screen w-screen'>
                {/* image for temporary use  */}
                <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
            </div>
            <div className=' flex flex-col justify-end h-screen absolute top-0 w-full'>
                <div className='h-[30%] p-6 bg-white relative'>
                    <h5 ref={panelCloseRef} onClick={() => {
                        setPanelOpen(false)
                    }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form onSubmit={(e) => {
                        submitHandler(e)
                    }}>
                        <div className="line absolute h-16 w-1 top-[45%] left-10 bg-gray-700 rounded-full"></div>
                        <input
                            onFocus={() => {
                                setPanelOpen(true)
                                setActiveField('pickup')
                                setFormError('')
                            }}
                            value={pickup}
                            onChange={(e) => {
                                setPickup(e.target.value)
                                setFormError('')
                            }}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-5'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        <input
                            onFocus={() => {
                                setPanelOpen(true)
                                setActiveField('destination')
                                setFormError('')
                            }}
                            value={destination}
                            onChange={(e) => {
                                setDestination(e.target.value)
                                setFormError('')
                            }}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3 mb-4'
                            type="text"
                            placeholder='Enter your destination' />
                        {formError && (
                            <div className="text-red-600 text-sm absolute top-45 left-12">{formError}</div>
                        )}
                        <button
                            type="button"
                            className="w-full mt-3 bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
                            onClick={findTrip}
                        >
                            Find Ride
                        </button>
                    </form>
                </div>
                <div ref={panelRef} className='bg-white h-0'>
                    <LocationSearchPanel
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        pickup={pickup}
                        destination={destination}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                        setActiveField={setActiveField}
                    />
                </div>
            </div>
            <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <VehiclePanel setVehicleType={setVehicleType} fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
            </div>
            <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <ConfirmRide pickup={pickup} destination={destination} vehicleType={vehicleType} fare={fare} createRide={createRide} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} setVehicleFound={setVehicleFound} />
            </div>
            <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <LookingForDriver pickup={pickup} destination={destination} vehicleType={vehicleType} fare={fare} setVehicleFound={setVehicleFound} />
            </div>
            <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0  bg-white px-3 py-6 pt-12'>
                <WaitingForDriver waitingForDriver={waitingForDriver} />
            </div>
        </div>
    )
}

export default Home