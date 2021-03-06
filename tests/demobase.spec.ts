import {
  BN,
  Provider,
  setProvider,
  utils,
  workspace,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

import {
  createCollectionAddress,
  createDocumentAddress,
  findCollectionAddress,
  findDocumentAddress,
} from './utils';

describe('demobase', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());
  const program = workspace.Demobase;
  let collectionBump: number, documentBump: number;
  const documentId = 'ABCD1234';
  const applicationName = 'myApp';
  const application = Keypair.generate();

  it('should create application', async () => {
    // act
    await program.rpc.createApplication(applicationName, {
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
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          applicationAccount.name.filter((segment: number) => segment !== 0)
        )
      ),
      applicationName
    );
  });

  it('should create collection', async () => {
    // arrange
    const collectionName = 'things';
    const [collection, bump] = await findCollectionAddress(
      application.publicKey,
      collectionName
    );
    collectionBump = bump;
    // act
    await program.rpc.createCollection(collectionName, bump, {
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
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const [document, bump] = await findDocumentAddress(
      application.publicKey,
      collectionId,
      documentId
    );
    const content = 'sample content';
    documentBump = bump;
    // act
    await program.rpc.createDocument(documentId, content, documentBump, {
      accounts: {
        document,
        collection: collectionId,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collectionId
    );
    const documentAccount = await program.account.document.fetch(document);
    assert.ok(collectionAccount.count.eq(new BN(1)));
    assert.ok(
      documentAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          documentAccount.content.filter((segment: number) => segment !== 0)
        )
      ),
      content
    );
  });

  it('should update document', async () => {
    // arrange
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const document = await createDocumentAddress(
      application.publicKey,
      collectionId,
      documentId,
      documentBump
    );
    const content = 'updated sample content';
    // act
    await program.rpc.updateDocument(content, {
      accounts: {
        document,
        collection: collectionId,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const documentAccount = await program.account.document.fetch(document);
    assert.equal(
      utils.bytes.utf8.decode(
        new Uint8Array(
          documentAccount.content.filter((segment: number) => segment !== 0)
        )
      ),
      content
    );
  });

  it('should delete document', async () => {
    // arrange
    const collectionName = 'things';
    const collectionId = await createCollectionAddress(
      application.publicKey,
      collectionName,
      collectionBump
    );
    const document = await createDocumentAddress(
      application.publicKey,
      collectionId,
      documentId,
      documentBump
    );
    // act
    await program.rpc.deleteDocument({
      accounts: {
        document,
        collection: collectionId,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const collectionAccount = await program.account.collection.fetch(
      collectionId
    );
    assert.ok(collectionAccount.count.eq(new BN(0)));
  });
});
