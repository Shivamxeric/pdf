import React, { useState } from 'react';
import { Client, Storage, Account } from 'appwrite';
import axios from 'axios';
import './App.css';
// App.jsx


const client = new Client()
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const storage = new Storage(client);
const account = new Account(client);

function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [authType, setAuthType] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const shortenUrl = async (longUrl) => {
    try {
      const response = await axios.post(
        'https://api-ssl.bitly.com/v4/shorten',
        { long_url: longUrl },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_BITLY_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.link;
    } catch (error) {
      console.error('Error shortening URL:', error);
      return longUrl;
    }
  };

  const handleUpload = async () => {
    if (!image) return alert('Please select an image to upload');
    setLoading(true);

    try {
      const response = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        'unique()',
        image
      );
      const longUrl = new URL(
        storage.getFileView(import.meta.env.VITE_APPWRITE_BUCKET_ID, response.$id)
      ).href;
      const shortUrl = await shortenUrl(longUrl);
      setImageUrl(shortUrl);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error uploading image.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl)
        .then(() => {
          setPopup(true);
          setTimeout(() => setPopup(false), 3000);
        })
        .catch((err) => console.error('Failed to copy URL:', err));
    }
  };

  const toggleAuth = (type) => {
    setAuthType(type);
    setAuthVisible(true);
    setEmail(''); // Clear email and password
    setPassword('');
  };

  const handleAuth = async () => {
    try {
      if (authType === 'login') {
        await account.createSession(email, password);
        alert('Login successful!');
      } else {
        await account.create(email, password);
        await account.createSession(email, password);
        alert('Signup successful! You are now logged in.');
      }
      setAuthVisible(false); // Close modal on success
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Error during authentication.');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Image Upload App</h1>
        <div>
          <button onClick={() => toggleAuth('login')}>Login</button>
          <button onClick={() => toggleAuth('signup')}>Sign Up</button>
        </div>
      </header>

      <main className="main-content">
        <div className="upload-container">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>

        {imageUrl && (
          <div className="uploaded-image">
            <h3>Your Image URL:</h3>
            <div className="url-section">
              <span>{imageUrl}</span>
              <button onClick={copyToClipboard}>Copy URL</button>
            </div>
            {/* Thumbnail display */}
            <div className="thumbnail">
              <img src={imageUrl} alt="Uploaded" />
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2024 Shivam Jha. All rights reserved.</p>
      </footer>

      {popup && <div className="popup">URL copied to clipboard!</div>}

      {authVisible && (
        <div className="auth-container">
          <h2>{authType === 'login' ? 'Login' : 'Sign Up'}</h2>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleAuth}>
            {authType === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
