import "react-native-get-random-values";

import nacl from "tweetnacl";
import * as SecureStore
from "expo-secure-store";

import {
 encodeBase64,
 decodeBase64,
 encodeUTF8,
 decodeUTF8
}
from "tweetnacl-util";

import {
 sha256
}
from
"@noble/hashes/sha2";

import { hkdf } from "@noble/hashes/hkdf";

console.log(
 "GLOBAL CRYPTO",
 global.crypto
);

console.log(
 "GET RANDOM VALUES",
 global.crypto?.getRandomValues
);

export const N_ROTATE = 20; // tune this

export const generateRatchetKeyPair = () => {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    privateKey: encodeBase64(kp.secretKey),
  };
};

// DH ratchet step: fold a fresh DH output into the root key,
// producing a new root key + a new chain key for one direction.
export const dhRatchetStep = (rootKey, myPrivateKey, peerPublicKey) => {
  const dhOut = nacl.box.before(
    decodeBase64(peerPublicKey),
    decodeBase64(myPrivateKey)
  );

  const okm = hkdf(
    sha256,
    dhOut,
    decodeBase64(rootKey),   // salt = old root key (binds to history)
    new TextEncoder().encode("DHRatchet"),
    64
  );

  return {
    rootKey: encodeBase64(okm.slice(0, 32)),
    chainKey: encodeBase64(okm.slice(32, 64)),
  };
};

export const generateIdentityKeys = async(user)=>{

  console.log(
  "saving keys for",
  user
);
  const keyPair = nacl.box.keyPair();

  const publicKey = encodeBase64(
    keyPair.publicKey
   );

  const privateKey = encodeBase64(
    keyPair.secretKey
   );

  await SecureStore.setItemAsync(

   `identityPrivateKey_${user}`,

   privateKey
  );

  await SecureStore.setItemAsync(

   `identityPublicKey_${user}`,

   publicKey
  );

  console.log("pubKey",publicKey,"privKey",privateKey);

  return {
   publicKey,
   privateKey
  };
};

export const getIdentityKeys = async(user)=>{

  console.log("getting keys of",user)

  const publicKey =

   await SecureStore.getItemAsync(
    `identityPublicKey_${user}`
   );

  const privateKey =

   await SecureStore.getItemAsync(
    `identityPrivateKey_${user}`
   );

  return {
   publicKey,
   privateKey
  };
};

export const deriveSharedSecret = (

  myPrivateKey,

  receiverPublicKey

 )=>{

  const shared =

   nacl.box.before(

    decodeBase64(
     receiverPublicKey
    ),

    decodeBase64(
     myPrivateKey
    )
   );

  return encodeBase64(
   shared
  );
};

export const encryptMessage = (
 plaintext,
 messageKey
) => {

 const nonce =
  nacl.randomBytes(
   nacl.secretbox.nonceLength
  );

 const cipher =
  nacl.secretbox(
   new TextEncoder().encode(
    plaintext
   ),
   nonce,
   decodeBase64(messageKey)
  );

 return {
  cipherText:
   encodeBase64(cipher),

  nonce:
   encodeBase64(nonce)
 };
};

export const decryptMessage = (
 cipherText,
 nonce,
 messagekey
) => {

 const plain =
  nacl.secretbox.open(
   decodeBase64(cipherText),
   decodeBase64(nonce),
   decodeBase64(messagekey)
  );

 if (!plain) {
  throw new Error(
   "Decryption failed"
  );
 }

 return new TextDecoder()
  .decode(plain);
};

export const deriveRootKey = (
 sharedSecret
) => {

 const hash =
  sha256(
   decodeBase64(sharedSecret)
  );

 return encodeBase64(hash);
};

export const deriveInitialChainKeys = (
 rootKey
) => {

 const rootBytes =
  decodeBase64(rootKey);

 const sendChainKey =
  encodeBase64(
   sha256(
    new Uint8Array([
      ...rootBytes,
      ...new TextEncoder()
       .encode("send")
    ])
   )
  );

 const receiveChainKey =
  encodeBase64(
   sha256(
    new Uint8Array([
      ...rootBytes,
      ...new TextEncoder()
       .encode("receive")
    ])
   )
  );

 return {
  sendChainKey,
  receiveChainKey
 };
};

export const deriveMessageKey = (chainKey) => {

  const bytes =
    decodeBase64(chainKey);

  return encodeBase64(
    sha256(
      new Uint8Array([
        ...bytes,
        ...new TextEncoder()
          .encode("msg")
      ])
    )
  );
};

export const advanceChainKey = (chainKey) => {

  const bytes =
    decodeBase64(chainKey);

  return encodeBase64(
    sha256(
      new Uint8Array([
        ...bytes,
        ...new TextEncoder()
          .encode("chain")
      ])
    )
  );
};