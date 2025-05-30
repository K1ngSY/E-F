import React, { useState } from 'react';
import { Button } from '@mui/material';

export default function ApplicationForm({ contract, account }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('application', file);

      const response = await fetch('http://localhost:3001/pools/1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      const fileUrl = data.fileUrl || '';

      // Use a fixed metadata hash or handle accordingly
      const metadataHash = "QmExampleMetadataHash";

      await contract.methods.submitApplication(metadataHash).send({ from: account });

      alert('Application submitted!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Submit Application'}
      </Button>
    </div>
  );
}

