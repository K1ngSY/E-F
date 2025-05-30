import Web3 from 'web3';
import contractABI from './ScholarTrustABI.json'; // Put ABI JSON here
const contractAddress = '0xYourContractAddressHere';

export function getContract(web3) {
  return new web3.eth.Contract(contractABI, contractAddress);
}

