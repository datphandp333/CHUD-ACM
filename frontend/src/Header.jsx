// src/Header.jsx
export default function Header() {
  return (
    <header style={{ 
        backgroundColor: 'rgba(52,52,52,0.9)',
     //backgroundColor: '#0038a7',
      padding: '20px', color: 'orange',
       textAlign: 'center',
        borderRadius: '8px', 
        boxShadow: '10px 10px 10px rgba(0,0,0,0.3)'
        }}>
      <h1>Login</h1>
      <p>Input UTA email</p>
    </header>
  );
}