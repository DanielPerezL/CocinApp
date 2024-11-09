//DEPRECATED

import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { uploadImage, getImage } from "../services/apiService"; // Importa las funciones necesarias

const ImageUploader: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Convertir a un array y establecer las imágenes seleccionadas
      setSelectedImages(Array.from(files));
    }
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      setUploadStatus("Please select at least one image.");
      return;
    }

    try {
      setUploadStatus("Uploading...");
      const imagePaths = await Promise.all(
        selectedImages.map((image) => uploadImage(image))
      );
      setUploadStatus(
        `Images uploaded successfully! Paths: ${imagePaths.join(", ")}`
      );
    } catch (error: any) {
      setUploadStatus(`Error uploading images: ${error.message}`);
    }
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      try {
        const fetchedPaths = await Promise.all(
          imageNames.map((name) => getImage(name))
        );
        setFetchedImages(fetchedPaths);
      } catch (error: any) {
        setUploadStatus(`Error fetching images: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h2>Upload Images</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        multiple // Permitir seleccionar múltiples archivos
      />
      <button onClick={handleUpload} disabled={selectedImages.length === 0}>
        Upload Images
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}

      <h2>Fetch Images by Names</h2>
      <input
        type="text"
        name="imagesFetcher"
        placeholder="Enter image names (comma separated)"
        value={imageNames.join(", ")}
        onChange={(e) =>
          setImageNames(e.target.value.split(",").map((name) => name.trim()))
        } // Almacenar nombres en un array
        onKeyDown={handleKeyDown}
      />
      {fetchedImages.length > 0 && (
        <div>
          <h3>Fetched Images:</h3>
          {fetchedImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Fetched ${index + 1}`}
              style={{ maxWidth: "300px", maxHeight: "300px", margin: "10px" }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
