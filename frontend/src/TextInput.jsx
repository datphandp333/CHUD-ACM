// src/TextInput.jsx
import { useState } from 'react';

export default function TextInput() {
  // 1. Set up state to remember the input value. It starts as an empty string ('').
  const [inputValue, setInputValue] = useState('');
  // 1. Add a state to let the user know if the save was successful
  const [statusMessage, setStatusMessage] = useState('');

  // 2. Create a function that runs every time the user types a character
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setStatusMessage(''); // Clear any previous messages when they start typing again
  };
// 2. The function that runs when the form is submitted
  const handleSubmit = async (event) => {
    // Prevent the browser from refreshing the page (default HTML form behavior)
    event.preventDefault(); 
    
    // Don't send empty data
    if (!inputValue) return;

    setStatusMessage('Saving...');
    try {
      // 3. Make the HTTP POST request to your backend URL
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST', // Tell the server we are sending data, not just asking for it
        headers: {
          'Content-Type': 'application/json', // Tell the server we are sending JSON data
        },
        // 4. Package our React state into a JSON string
        body: JSON.stringify({ 
          userName: inputValue 
        }),
      });

      if (response.ok) {
        setStatusMessage('Data saved successfully!');
        setInputValue(''); // Clear the input box after saving
      } else {
        setStatusMessage('Failed to save data on the server.');
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setStatusMessage('Network error. Could not reach the backend.');
    }
  };
  return (
    <div style={{ backgroundColor: 'rgba(52,52,52,0.9)',marginTop: '20px', padding: '15px', borderRadius: '8px', boxShadow: '10px 10px 10px rgba(0,0,0,0.3)', color: 'orange'}}>
      <h3>UTA Verification</h3>
      
      {/* 5. Wrap the input and button in a form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label htmlFor="name-input" style={{ fontWeight: 'bold' }}>
          Enter your email:
        </label>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            id="name-input"
            type="text" 
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type here..."
            style={{ padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #999', flexGrow: 1 }}
          />
          
          <button 
            type="submit" 
            style={{ padding: '8px 16px', backgroundColor: '#282c34', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '2px 2px 5px rgba(255, 255, 255, 0.3)' }}
          >
            Login
          </button>
        </div>
      </form>

      {/* Display our status message to the user */}
      {statusMessage && (
        <p style={{ marginTop: '15px', fontWeight: 'bold', color: statusMessage.includes('error') ? 'red' : 'green' }}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}