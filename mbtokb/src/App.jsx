import React, { useState } from 'react';
import { Client, Storage } from 'appwrite'; // Import Appwrite SDK
import './App.css';

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Your API Endpoint
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your project ID

const storage = new Storage(client);

const App = () => {
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [status, setStatus] = useState('');
  const [oldImageSize, setOldImageSize] = useState(null);
  const [newImageSize, setNewImageSize] = useState(null);
  const [fileId, setFileId] = useState(null); // To store uploaded file ID

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setOldImageSize(file.size); // Get the original image size
      setStatus('Image uploaded. Ready to compress!');
    }
  };

  const compressImage = () => {
    if (!image) return;

    // Placeholder for compression logic
    setStatus('Compressing image...');
    setTimeout(() => {
      // Mock compressed image (using the same image for preview purposes)
      setCompressedImage(URL.createObjectURL(image));
      
      // Simulate a new size for the compressed image (for demonstration purposes)
      const simulatedNewSize = Math.max(image.size * 0.5, 1); // Simulating compression to 50%
      setNewImageSize(simulatedNewSize);
      
      // Upload the compressed image to Appwrite
      uploadImage(image); // Pass the original image for uploading
      setStatus('Image compressed successfully!');
    }, 2000);
  };

  const uploadImage = async (file) => {
    try {
      const fileUploaded = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID, // Your bucket ID
        'unique()', // Unique ID
        file // The image file to upload
      );
      setFileId(fileUploaded.$id); // Store the uploaded file ID
      setStatus('Upload successful! Image ID: ' + fileUploaded.$id);
    } catch (error) {
      setStatus('Error during upload: ' + error.message);
    }
  };

  const downloadImage = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = 'compressed_image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app">
      <header className="header">Image Compression App</header>
      <main className="main-content">
        <div className="upload-container">
          <input
            type="file"
            accept="image/*"
            className="upload-input"
            onChange={handleImageChange}
          />
          <button onClick={compressImage}>Compress</button>
        </div>
        

        {oldImageSize && newImageSize && (
          <div className="size-info">
            <p>Old Image Size: {(oldImageSize / 1024).toFixed(2)} KB</p>
            <p>New Image Size: {(newImageSize / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {compressedImage && (
          <div>
            <img
              id='im'
              src={compressedImage}
              alt="Compressed Preview"
              className="compressed-image-preview"
            />
            <button className="download-button" onClick={downloadImage}>
              Download Compressed Image
            </button>
          </div>
        )}
      </main>
      <footer className="footer">
        &copy; 2024 All right reserved by Shivam Jha.
      </footer>
    </div>
  );
};

export default App;
