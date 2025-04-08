import React, { useState } from 'react';

const UploadImage = ({ onImageUpload, currentImage, className }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [uploadError, setUploadError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validation du fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setUploadError('Type de fichier non autorisé. Utilisez jpg, png, gif ou webp.');
        return;
      }

      if (file.size > maxSize) {
        setUploadError('La taille du fichier ne doit pas dépasser 5 Mo.');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);

      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onImageUpload(selectedFile);
    }
  };

  return (
    <div className={`upload-image-container ${className || ''}`}>
      <div className="file-input-wrapper">
        <input 
          type="file" 
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="file-input"
        />
        <button 
          type="button" 
          className="browse-button bg-blue-500 text-white px-4 py-2 rounded"
        >
          Choisir une image
        </button>
      </div>

      {uploadError && (
        <div className="error-message text-red-500 mt-2">
          {uploadError}
        </div>
      )}

      {previewUrl && (
        <div className="image-preview mt-4">
          <img 
            src={previewUrl} 
            alt="Aperçu de l'image" 
            className="max-w-full h-48 object-cover rounded"
          />
        </div>
      )}

      {selectedFile && (
        <button 
          type="button"
          onClick={handleUpload} 
          className="upload-button mt-2 bg-green-500 text-white px-4 py-2 rounded"
        >
          Télécharger l'image
        </button>
      )}
    </div>
  );
};

export default UploadImage;