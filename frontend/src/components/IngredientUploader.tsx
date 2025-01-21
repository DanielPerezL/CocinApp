import React, { useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { postIngredients } from "../services/apiService";
import { useTranslation } from "react-i18next";

const IngredientUploader: React.FC = () => {
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setUploadSuccess(null);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError(t("noFile"));
      return;
    }

    try {
      const fileContent = await file.text();
      await postIngredients(fileContent);
      setUploadSuccess(t("uploadIngredientsSuccessfull"));
    } catch (error) {
      setUploadError(t("uploadIngredientsError"));
    } finally {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <form className="mt-5">
      <div>
        <p className="display-5 text-primary">{t("uploadIngredients")}</p>

        <div className="alert alert-info">
          <h6>{t("uploadFormatExplanation")}</h6>
          <p>{t("uploadFormatDetails")}</p>
          <pre
            className="bg-light p-3 border rounded text-start"
            style={{ overflowX: "auto", whiteSpace: "pre-wrap" }}
          >
            {`[
    {
      "name_en": "Rice",
      "name_es": "Arroz",
      "default_unit": "g"
    },
    {
      "name_en": "Milk",
      "name_es": "Leche",
      "default_unit": "ml"
    },
    {
      "name_en": "Eggs",
      "name_es": "Huevos",
      "default_unit": "units"
    }
]`}
          </pre>
          <p className="text-muted">{t("uploadFormatNote")}</p>
        </div>

        <input
          type="file"
          id="fileUpload"
          className="form-control mt-2 mb-3"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleUpload}
          disabled={!file}
        >
          {t("upload")}
        </button>
      </div>
      {uploadError && <p className="mt-3 alert alert-danger">{uploadError}</p>}
      {uploadSuccess && (
        <p className="mt-3 alert alert-success">{uploadSuccess}</p>
      )}
    </form>
  );
};

export default IngredientUploader;
