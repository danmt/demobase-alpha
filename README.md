# Demobase Alpha

This is an alpha version of Demobase, this is a PoC and by no means is meant to be used in production. If you dare, you're on your own.

## Overview

Demobase is a platform enabling developers to build data-centric dapps, using document-oriented storage on-chain. It's modeled after [Firebase](), the core concepts are:

- Application: The main structure in the platform, it's an account at a an address generated by the user with `Keypair.generate()`, Applications have a collection count and a name, its owner would be a dapp developer.
- Collection: Applications consist of collections, each collection is an account at a PDA that uses as seed a "collection" string, a name and an application public key. Collections have a name, a document count and an application public key. It's owner would be a dapp developer.
- Document: Collections consist of documents, each document is an account at a PDA that uses as seed a "document" string, a client-side generated id, an application public key and a collection public key. Documents have an id, a content, an application public key and a collection public key. It's owner would be an end-user.

There's a logical relation between structures that looks like this:

Application -> Collection -> Document

Right now, the dapp developers are responsible of generating the IDs for the documents. It's part of the project goals to have a way to ease this for developers.

Even though the document's content is stored as an array of 32 `Uint8` values, the idea is to store these as JSON in Arweave and use Solana for handling indexing and fees, this enables users to interact with dapps that use Solana and Arweave but paying all the fees in Solana with a single wallet interaction.

## Running tests

Make sure to have `typescript` and `ts-mocha` globally installed. Once you have all the required packages installed you can call `npm run test` from the root path of the project.
