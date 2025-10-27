// Filename - TestPage.jsx

// Importing modules
import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function TestPage() {
    // useState for setting a javascript
    // object for storing and using data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [array, setArray] = useState([]);

    const fetchAPI = async () => {
        const response = await axios.get("http://localhost:8080/api");
        setArray(response.data.fruits);
        setLoading(false);
        console.log(response.data.fruits);
    };

    useEffect(() => {
        fetchAPI();
    }, [loading]);






    return (
        <div className="App">
            <header className="App-header">
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
                <h1>React and Flask</h1>
                {
                    array.map((fruit, index) => (
                        <div key={index}>
                      <p>{fruit}</p>
                        <br/>
                        </div>
                    ))}
            </header>
        </div>
    );
}
export default TestPage;