import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { uploadToIPFS } from '../utils/ipfs';

export default function ApplicationForm({ contract, account }) {
  const [name, setName] = useState('');
  const [essay, setEssay] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    const fileUrl = await uploadToIPFS(file);
    const metadata = JSON.stringify({ name, essay, file: fileUrl });
    const metadataHash = await uploadToIPFS(metadata);

    await contract.methods.submitApplication(metadataHash).send({ from: account });
    console.log('Simulated contract call with metadataHash:', metadataHash);
    alert('Application submitted! (Simulated)');
    // alert('Application submitted!');
  };

  return (
    <div>
      <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField fullWidth multiline label="Essay" value={essay} onChange={(e) => setEssay(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <Button variant="contained" onClick={handleSubmit}>Submit Application</Button>
    </div>
  );
}
