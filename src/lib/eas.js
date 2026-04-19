import { createWalletClient, custom, encodeAbiParameters, parseAbiParameters } from 'viem';
import { mainnet } from 'viem/chains';

const EAS_CONTRACT = '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587';
const SCHEMA_UID = '0xef1b64c8b49daf8ba1832fc590798e0af6f9a81cc345bfb2f2f44598b74d01f5';

export async function connectWallet() {
  if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask or similar.");
  const walletClient = createWalletClient({
    chain: mainnet,
    transport: custom(window.ethereum)
  });
  const [address] = await walletClient.requestAddresses();
  
  try {
    await walletClient.switchChain({ id: mainnet.id });
  } catch (err) {
    const error = /** @type {any} */ (err);
    if (error.code === 4902 || (error.message && error.message.includes('Unrecognized chain ID'))) {
      await walletClient.addChain({ chain: mainnet });
    } else {
      console.warn("Could not switch to Mainnet. Ensure network matches before signing:", error);
    }
  }

  return { walletClient, address };
}

export async function createAndSignAttestation(walletClient, address) {
  const encodedData = encodeAbiParameters(
    parseAbiParameters('string eventName, string eventLocation, bytes32 eventID, uint64 checkInTime, bytes32 ticketID'),
    [
      'Uncloud Day 2026', 
      'LibertyLoft, Prague, CZ', 
      '0x0000000000000000000000000000000000000000000000000000000000000000', 
      0n, 
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    ]
  );

  const { Offchain } = await import('@ethereum-attestation-service/eas-sdk');
  // Initialize with Mainnet parameters
  const offchain = new Offchain({ address: EAS_CONTRACT, version: '1.2.0', chainId: 1n }, 1);

  // Native viem wrapper matching ethers Signer duck typing used by EAS SDK
  const signerAdaptor = {
    getAddress: async () => address,
    signTypedData: async (domain, types, value) => {
      // The correct typed domain is passed natively from the SDK
      return await walletClient.signTypedData({
        domain,
        types: types,
        primaryType: "Attest",
        message: value,
        account: address
      });
    }
  };

  const attestationBlob = await offchain.signOffchainAttestation({
    recipient: '0x0000000000000000000000000000000000000000',
    expirationTime: 0n,
    time: BigInt(Math.floor(Date.now() / 1000)),
    revocable: true,
    nonce: 0n,
    schema: SCHEMA_UID,
    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    data: encodedData
  }, signerAdaptor);

  // Perfectly replicate API requirement converting BigInts correctly
  const textJson = JSON.stringify({
    sig: attestationBlob,
    signer: address
  }, (key, value) => (typeof value === 'bigint' ? value.toString() : value));

  const res = await fetch('https://easscan.org/offchain/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: `eas.txt`,
      textJson
    })
  });

  if (!res.ok) {
     const text = await res.text();
     throw new Error("Failed to submit offchain: " + text);
  }
  return res.json();
}

export async function fetchAttendees() {
  const query = `
    query {
      attestations(where: {
        schemaId: { equals: "${SCHEMA_UID}" },
        decodedDataJson: { contains: "Uncloud Day 2026" }
      }, orderBy: [{ time: desc }]) {
        id
        attester
        time
      }
    }
  `;
  const res = await fetch('https://easscan.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  return data.data?.attestations || [];
}

export async function resolveEnsData(address) {
  try {
    const res = await fetch(`https://api.web3.bio/profile/${address}`);
    if (!res.ok) return { name: null, avatar: null };
    
    const data = await res.json();
    const ensRecord = Array.isArray(data) ? data.find(p => p.platform === 'ens') : null;
    
    if (ensRecord) {
      return { name: ensRecord.identity, avatar: ensRecord.avatar };
    }
    return { name: null, avatar: null };
  } catch (e) {
    console.error("ENS resolution failed", e);
    return { name: null, avatar: null };
  }
}
