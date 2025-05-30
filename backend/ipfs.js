// backend/ipfs.js
const { create } = require("ipfs-http-client");

// 1) 连接到本地 IPFS 守护进程
const ipfs = create({ url: "http://127.0.0.1:5001/api/v0" });

/**
 * 上传 Buffer 或流到 IPFS，返回 CID
 * @param {Buffer|ReadableStream|string} data
 */
async function addFile(data) {
  const { cid } = await ipfs.add(data);
  return cid.toString();
}

module.exports = { addFile };
