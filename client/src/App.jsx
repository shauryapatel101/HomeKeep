import { useEffect, useState } from "react";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/")
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.message);
            })
            .catch((error) => {
                console.error("Error connecting to server:", error);
            });
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <h1 className="text-xl font-bold text-slate-800">{message || "Connecting to HomeKeep..."}</h1>
        </div>
    );
}

export default App;
