// src/App.jsx
import Header from './Header';
import TextInput from './TextInput';
import myImage from './assets/UTA_image2.jpg';
import './App.css';

function App() {
  return (
    <div
      style={{ 
        

      // backgroundImage: `url(${myImage})`, 
      // backgroundSize:'cover',
      // backgroundRepeat: 'no-repeat',
      // padding: '250px' 
    }}>
      <Header />
      
      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        

        <TextInput />
      </main>
    </div>
  );
}

export default App;