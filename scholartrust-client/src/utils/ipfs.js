import { create } from 'ipfs-http-client';

const client = create({
  url: 'https://ipfs.infura.io:5001/api/v0'
});

export async function uploadToIPFS(file) {
  const result = await client.add(file);
  return `https://ipfs.infura.io/ipfs/${result.path}`;
}
