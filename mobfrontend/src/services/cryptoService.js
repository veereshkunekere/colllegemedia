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
import { use } from "react";


console.log(
 "GLOBAL CRYPTO",
 global.crypto
);

console.log(
 "GET RANDOM VALUES",
 global.crypto?.getRandomValues
);

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