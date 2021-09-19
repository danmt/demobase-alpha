import { PublicKey } from '@solana/web3.js';
import { DEMOBASE_PROGRAM_ID } from './constants';

export const findCollectionAddress = (applicationId: PublicKey) => {
  return PublicKey.findProgramAddress(
    [Buffer.from('collection', 'utf8'), applicationId.toBuffer()],
    DEMOBASE_PROGRAM_ID
  );
};

export const createCollectionAddress = (
  applicationId: PublicKey,
  bump: number
) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('collection', 'utf-8'),
      applicationId.toBuffer(),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const findDocumentAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey
) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('document', 'utf8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
    ],
    DEMOBASE_PROGRAM_ID
  );
};

export const createDocumentAddress = (
  applicationId: PublicKey,
  collectionId: PublicKey,
  bump: number
) => {
  return PublicKey.createProgramAddress(
    [
      Buffer.from('document', 'utf-8'),
      applicationId.toBuffer(),
      collectionId.toBuffer(),
      Uint8Array.from([bump]),
    ],
    DEMOBASE_PROGRAM_ID
  );
};
