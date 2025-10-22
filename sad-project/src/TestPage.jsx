// Filename - TestPage.js

// Importing modules
import React, { useState, useEffect } from "react";
import "./App.css";

export default function TestPage() {
    // usestate for setting a javascript
    // object for storing and using data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setdata] = useState({
        name: "",
        age: 0,
        date: "YOU MUST",
        programming: "CHANGE",
    });
    const num = 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/data");
                const data = await response.json();
                setdata({name: data.name,
                age: data.Age,
                date: data.date,
                programming: data.programming});
            } catch (error) {
                console.error("Error fetching user:", error);
                setError("Failed to load users.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/data') // Hopefully this in our backend
            .then( res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setdata({
                    name: data.name,
                    age: data.Age,
                    date: data.Date,
                    programming: data.programming,
                });
                setLoading(false)
            })
            .catch(err => console.error('Error loading accounts:', err));
    }, [setdata,data]);



    return (
        <div className="App">
            <header className="App-header">
                <h1>React and Flask</h1>
                {/* Calling a data from setdata for showing */}
                <p>{data.name}</p>
                <p>{data.age}</p>
                <p>{data.date}</p>
                <p>{data.programming}</p>

            </header>
        </div>
    );
}
