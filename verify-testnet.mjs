import {readFile} from 'node:fs/promises';
import {verifyRegistry} from './chain.mjs';
const evidence=JSON.parse(await readFile(new URL('./testnet-evidence.json',import.meta.url),'utf8'));
console.log(JSON.stringify(await verifyRegistry('ledgerorder',evidence.verificationInput,evidence.config),null,2));
