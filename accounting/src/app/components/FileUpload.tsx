// FileUpload.jsx
import { Button } from "@mui/material";
import React from "react";

const FileUpload = ({
  handleFileButtonClick,
  fileInputRef,
  handleFileUpload,
}: any) => {
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileButtonClick}
      >
        Ladda upp CSV
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FileUpload;
