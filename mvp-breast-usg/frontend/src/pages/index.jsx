import React from "react";
// Path ini diperbaiki! Gunakan path relatif, bukan alamat C:\...
import UploadAndResult from './PredictPage.jsx'; 

function IndexPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>USG Breast Cancer Predictor</h1>
      <p>Upload an image to get prediction</p>
      {/* Komponen UploadAndResult akan muncul di sini */}
      <UploadAndResult />
    </div>
  );
}

export default IndexPage;