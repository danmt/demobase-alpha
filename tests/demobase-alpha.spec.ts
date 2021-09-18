import {
  BN,
  Provider,
  setProvider,
  utils,
  web3,
  workspace,
} from '@project-serum/anchor';
import { assert } from 'chai';
import { findCollectionAddress } from './utils';

describe('demobase-alpha', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.DemobaseAlpha;
  const document1 = web3.Keypair.generate();

  it('should create collection', async () => {
    // arrange
    const [collection, bump] = await findCollectionAddress();
    // act
    await program.rpc.createCollection(bump, {
      accounts: {
        collection: collection,
        authority: program.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    assert.equal(collectionAccount.count, 0);
    assert.ok(
      collectionAccount.authority.equals(program.provider.wallet.publicKey)
    );
  });

  it('should create document', async () => {
    // arrange
    const [collection] = await findCollectionAddress();
    const content = 'sample content';
    // act
    await program.rpc.createDocument(content, {
      accounts: {
        document: document1.publicKey,
        collection: collection,
        authority: program.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [document1],
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    const documentAccount = await program.account.document.fetch(
      document1.publicKey
    );
    assert.ok(collectionAccount.count.eq(new BN(1)));
    assert.ok(
      documentAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          documentAccount.content.filter((segment) => segment !== 0)
        )
      ),
      content
    );
  });

  it('should update document', async () => {
    // arrange
    const content = 'sample content';
    const [collection] = await findCollectionAddress();
    // act
    await program.rpc.updateDocument(content, {
      accounts: {
        document: document1.publicKey,
        collection: collection,
        authority: program.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
    });
    // assert
    const documentAccount = await program.account.document.fetch(
      document1.publicKey
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          documentAccount.content.filter((segment) => segment !== 0)
        )
      ),
      content
    );
  });

  it('should delete document', async () => {
    // arrange
    const [collection] = await findCollectionAddress();
    // act
    await program.rpc.deleteDocument({
      accounts: {
        document: document1.publicKey,
        collection: collection,
        authority: program.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    assert.ok(collectionAccount.count.eq(new BN(0)));
  });
});
