import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';

const INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Surat", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna",
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli",
    "Vasai-Virar", "Varanasi", "Srinagar", "Dhanbad", "Jodhpur", "Amritsar", "Raipur", "Allahabad", "Coimbatore",
    "Jabalpur", "Gwalior", "Vijayawada", "Madurai", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Mysore",
    "Tiruchirappalli", "Bareilly", "Aligarh", "Tiruppur", "Gurgaon", "Moradabad", "Jalandhar", "Bhubaneswar",
    "Salem", "Warangal", "Mira-Bhayandar", "Jalgaon", "Kota"
];

interface LocationInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, name }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        const inputValue = e.target.value;
        if (inputValue.length > 0) {
            const filtered = INDIAN_CITIES.filter(city =>
                city.toLowerCase().includes(inputValue.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectCity = (city: string) => {
        const event = {
            target: {
                name: name,
                value: city
            }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
        setShowSuggestions(false);
    };

    return (
        <div className="relative space-y-2" ref={wrapperRef}>
            <Label htmlFor={name} className="text-gray-700 font-medium">Location</Label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    placeholder="Search for a city (e.g. Jaipur)"
                    className="pl-9 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white/70"
                    autoComplete="off"
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((city) => (
                        <button
                            key={city}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 transition-colors"
                            onClick={() => handleSelectCity(city)}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationInput;
