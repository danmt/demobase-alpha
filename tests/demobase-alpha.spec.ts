import {
  BN,
  Provider,
  setProvider,
  utils,
  workspace,
} from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('demobase-alpha', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.DemobaseAlpha;
  const application = Keypair.generate();
  let collection: PublicKey, document: PublicKey;
  let collectionBump: number, documentBump: number;

  it('should create application', async () => {
    // act
    await program.rpc.createApplication({
      accounts: {
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    // assert
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.ok(applicationAccount.count.eq(new BN(0)));
    assert.ok(
      applicationAccount.authority.equals(program.provider.wallet.publicKey)
    );
  });

  it('should create collection', async () => {
    // arrange
    [collection, collectionBump] = await PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode('collection'), application.publicKey.toBuffer()],
      program.programId
    );
    // act
    await program.rpc.createCollection(collectionBump, {
      accounts: {
        collection,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    assert.ok(applicationAccount.count.eq(new BN(1)));
    assert.ok(collectionAccount.count.eq(new BN(0)));
    assert.ok(
      collectionAccount.authority.equals(program.provider.wallet.publicKey)
    );
  });

  it('should create document', async () => {
    // arrange
    [document, documentBump] = await PublicKey.findProgramAddress(
      [Buffer.from('document', 'utf-8'), application.publicKey.toBuffer()],
      program.programId
    );
    const content = 'sample content';
    // act
    await program.rpc.createDocument(content, documentBump, {
      accounts: {
        document,
        collection,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    const documentAccount = await program.account.document.fetch(document);
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
    // act
    await program.rpc.updateDocument(content, {
      accounts: {
        document,
        collection,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const documentAccount = await program.account.document.fetch(document);
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
    // act
    await program.rpc.deleteDocument({
      accounts: {
        document,
        collection,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collection
    );
    assert.ok(collectionAccount.count.eq(new BN(0)));
  });
});
