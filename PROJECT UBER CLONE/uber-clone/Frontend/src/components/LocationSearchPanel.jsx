import React, { useEffect, useState } from 'react'
import axios from 'axios'

const LocationSearchPanel = (props) => {
    const { pickup, destination, setPickup, setDestination, activeField, setPanelOpen, setVehiclePanel, setActiveField } = props;
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let input = '';
        if (activeField === 'pickup') input = pickup;
        else if (activeField === 'destination') input = destination;
        input = input.trim();
        if (!input) {
            setSuggestions([])
            return;
        }
        setLoading(true)
        axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
            params: { input: input },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((res) => {
                setSuggestions(res.data || [])
            })
            .catch(() => setSuggestions([]))
            .finally(() => setLoading(false))
    }, [pickup, destination, activeField])

    const handleSelect = (value) => {
        if (activeField === 'pickup') {
            setPickup(value)
            setActiveField('destination')
            // keep panel open
        } else if (activeField === 'destination') {
            setDestination(value)
            // setPanelOpen(false)
            // setVehiclePanel(true)
        }
    }

    return (
        <div className='mt-10'>
            {loading && <div className="p-3 text-gray-500">Loading...</div>}
            {suggestions.length > 0 ? (
                suggestions.map((elem, idx) => (
                    <div key={idx} onClick={() => handleSelect(elem)} className='flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start'>
                        <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full'><i className="ri-map-pin-fill"></i></h2>
                        <h4 className='font-medium'>{elem}</h4>
                    </div>
                ))
            ) : !loading && <div className="p-3 text-gray-400">No suggestions</div>}
        </div>
    )
}

export default LocationSearchPanel