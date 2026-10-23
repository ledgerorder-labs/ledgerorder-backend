# Reproduce the public testnet milestone

Captured 23 October 2026. This is an early open-source pilot, not a production deployment.

## Read the deployed registry

Clone the sibling repositories listed in INTEGRATION.md. Use Node.js 24+:

```bash
npm ci
npm test
node verify-testnet.mjs
```

The last command makes read-only requests to Stellar testnet using the pinned official SDK 17.3.0. No account secret or wallet is required. It checks network passphrase, contract WASM hash, exact storage key and expected record values. A TLS RPC response is not an independently verified consensus proof.

- Contract: `CBH3RU5PK6IHD2OXSARZT55NXQJYPX375TNOXRJCLKP2BWWJNPIWWLWE`
- WASM SHA-256: `08462c30becd675fb7e3f66f9695bdb64e764f0c549db062d85f7f8d25b95582`
- Deployment transaction: `585ae8dd23a2836ad0c78d97ebfff12bc456e3513e38791b91c750a055fac413`
- Milestone transaction: `20dada732ec141502adde4f68d868bf78b49ff17fd4f693272a37edbdaa1054a`
- Milestone ledger: 5346494

Full public inputs, recorded ledger, storage lifetime and successful HTTP response are in testnet-evidence.json. Contract artifacts were built with official Stellar CLI 28.1.0, soroban-sdk 29.0.1 and committed Cargo.lock using `stellar contract build --locked`. Only disposable Friendbot testnet funds were used. No signing secrets are distributed.

## HTTP verification

Set TESTNET_RPC_URL, TESTNET_CONTRACT_ID and TESTNET_WASM_HASH using `config` in the evidence file, then start the backend. POST the evidence file's `verificationInput` object as JSON to `/api/contracts/verify`. This endpoint does not sign or submit transactions. Network and code pins are operator configuration; request bodies cannot override them. Use existing API_TOKEN access gates if configured.

Failures distinguish missing configuration (503), malformed input (422), network/code/value mismatch (409), unavailable or archived entry (404), and RPC failure (502). A missing entry is not proof that it never existed. Testnet resets and storage expiry can invalidate a previously successful live check. TTL management remains an open contributor issue.

## What this demonstrates

The original export contains real testnet events. The second export is an intentionally modified copy, not an independent provider.

Run `node replay-testnet.mjs` offline to decode the saved RPC XDR capture, reproduce the missing-event comparison, and recompute all three anchored digests. The saved original contains one actual emitted testnet event. Its transactionIndex came from RPC; ordering is never inferred from timestamps. Coverage is producer-declared. This bounded capture is not a general indexing service or an independent provider comparison.
