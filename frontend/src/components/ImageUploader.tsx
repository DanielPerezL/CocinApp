import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { uploadImage, getImage } from "../services/apiService"; // Importa las funciones necesarias

const ImageUploader: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [fetchedImage, setFetchedImage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setUploadStatus("Please select an image first.");
      return;
    }

    try {
      setUploadStatus("Uploading...");
      const imagePath = await uploadImage(selectedImage);
      setUploadStatus(`Image uploaded successfully! Path: ${imagePath}`);
    } catch (error: any) {
      setUploadStatus(`Error uploading image: ${error.message}`);
    }
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      try {
        const imagePath = await getImage(imageName);
        setFetchedImage(imagePath);
      } catch (error: any) {
        setUploadStatus(`Error fetching image: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h2>Upload an Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedImage}>
        Upload Image
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}

      <h2>Fetch Image by Name</h2>
      <input
        type="text"
        placeholder="Enter image name"
        value={imageName}
        onChange={(e) => setImageName(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {fetchedImage && (
        <div>
          <h3>Fetched Image:</h3>
          <img
            src={fetchedImage}
            alt="Fetched"
            style={{ maxWidth: "300px", maxHeight: "300px" }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
