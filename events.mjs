import {digest} from '../ledgerorder-contracts/proposal.mjs';
import {TESTNET_PASSPHRASE} from './chain.mjs';
// This adapter handles a bounded, explicitly scoped RPC capture. It is not an ingestion worker.
export async function normalizeCapture(capture){
 const {xdr,StrKey}=await import('@stellar/stellar-sdk');
 if(capture?.networkPassphrase!==TESTNET_PASSPHRASE)throw new Error('Capture is not Stellar testnet');
 if(!StrKey.isValidContract(capture.contractId)||typeof capture.provider!=='string'||!capture.provider)throw new Error('Invalid capture identity');
 for(const n of [capture.startLedger,capture.endLedger])if(!Number.isSafeInteger(n)||n<1||n>4294967295)throw new Error('Invalid capture window');
 if(capture.endLedger<capture.startLedger||!Array.isArray(capture.events)||capture.events.length>10000)throw new Error('Invalid capture bounds');
 const events=capture.events.map(e=>{
  if(e.contractId!==capture.contractId||e.type!=='contract'||e.inSuccessfulContractCall===false)throw new Error('Event outside successful contract scope');
  const id=typeof e.id==='string'?e.id.match(/^\d{19}-(\d{10})$/):null;
  if(!id||!Number.isSafeInteger(e.ledger)||e.ledger<capture.startLedger||e.ledger>capture.endLedger)throw new Error('Invalid event identity/window');
  if(!Number.isSafeInteger(e.transactionIndex)||e.transactionIndex<0||e.transactionIndex>4294967295)throw new Error('RPC transaction index required; never infer it from timestamps');
  const eventIndex=Number(id[1]);if(eventIndex>4294967295)throw new Error('Event index exceeds u32');
  if(!Array.isArray(e.topic)||!e.topic.length||e.topic.length>4||typeof e.value!=='string')throw new Error('Malformed event XDR');
  for(const topic of e.topic)xdr.ScVal.fromXdr(topic,'base64');xdr.ScVal.fromXdr(e.value,'base64');
  return {id:e.id,ledger:e.ledger,transactionIndex:e.transactionIndex,eventIndex,payloadDigest:digest({contractId:e.contractId,topic:e.topic,value:e.value}),sourceTransactionHash:e.txHash};
 });
 return {schemaVersion:1,network:TESTNET_PASSPHRASE,scope:digest({domain:'ledgerorder.rpc-capture.v1',contractId:capture.contractId,filter:capture.filter??'contract-events'}),provider:capture.provider,startLedger:capture.startLedger,endLedger:capture.endLedger,ranges:capture.coverageDeclared===true?[{start:capture.startLedger,end:capture.endLedger}]:[],events,provenance:{decoder:'@stellar/stellar-sdk@17.3.0',source:capture.rpcUrl??null,coverage:'producer-declared; not a consensus proof'}};
}
