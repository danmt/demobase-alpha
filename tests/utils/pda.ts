import { PublicKey } from '@solana/web3.js';
import { DEMOBASE_PROGRAM_ID } from './constants';

export const findCollectionAddress = () => {
  return PublicKey.findProgramAddress(
    [Buffer.from('collection', 'utf8')],
    DEMOBASE_PROGRAM_ID
  );
};
