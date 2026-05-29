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
 "BEFORE KEYPAIR",
 global.crypto?.getRandomValues
);
  const keyPair = nacl.box.keyPair();

  const publicKey = encodeBase64(
    keyPair.publicKey
   );

  const privateKey = encodeBase64(
    keyPair.secretKey
   );

  await SecureStore.setItemAsync(

   `privateKey_${user}`,

   privateKey
  );

  await SecureStore.setItemAsync(

   `publicKey_${user}`,

   publicKey
  );

  console.log("pubKey",publicKey,"privKey",privateKey);

  return {
   publicKey,
   privateKey
  };
};

export const getIdentityKeys = async(user)=>{

  const publicKey =

   await SecureStore.getItemAsync(
    `publicKey_${user}`
   );

  const privateKey =

   await SecureStore.getItemAsync(
    `privateKey_${user}`
   );

  return {
   publicKey,
   privateKey
  };
};

export const ensureIdentityKeys = async(user)=>{
  const existingKeys = await getIdentityKeys(user);

  if (existingKeys.publicKey && existingKeys.privateKey) {
    return existingKeys;
  }

  return await generateIdentityKeys(user);
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

export const deriveInitialSessionKeys = async(

  sharedSecret,

  isInitiator

 )=>{

  const secretBytes =

   decodeBase64(
    sharedSecret
   );

  const sendSeed =

   sha256(

    new Uint8Array([
      ...secretBytes,
      1
    ])
   );

  const receiveSeed =

   sha256(

    new Uint8Array([
      ...secretBytes,
      2
    ])
   );

  const sendChainKey =

   encodeBase64(sendSeed);

  const receiveChainKey =

   encodeBase64(receiveSeed);

  return isInitiator

   ? {

      sendChainKey,

      receiveChainKey,

     }

   : {

      sendChainKey:
       receiveChainKey,

      receiveChainKey:
       sendChainKey,
     };
};

// export const encryptMessage = async(

//   plainText,

//   messageKey

//  )=>{

//   const nonce =
//    nacl.randomBytes(24);

//   const encrypted =

//    nacl.secretbox(

//     decodeUTF8(
//      plainText
//     ),

//     nonce,

//     decodeBase64(
//      messageKey
//     )
//    );

//   return {

//    cipherText:

//     encodeBase64(
//      encrypted
//     ),

//    nonce:

//     encodeBase64(
//      nonce
//     )
//   };
// };

// export const decryptMessage = async(

//   cipherText,

//   nonce,

//   messageKey

//  )=>{

//   const decrypted =

//    nacl.secretbox.open(

//     decodeBase64(
//      cipherText
//     ),

//     decodeBase64(
//      nonce
//     ),

//     decodeBase64(
//      messageKey
//     )
//    );

//   if(!decrypted){

//    throw new Error(
//     "Decryption failed"
//    );
//   }

//   return encodeUTF8(
//    decrypted
//   );
// };

export const ratchetChainKey = async(chainKey)=>{

  const keyBytes =

   decodeBase64(
    chainKey
   );

  const messageKeyBytes =

   sha256(

    new Uint8Array([
      ...keyBytes,
      1
    ])
   );

  const nextChainKeyBytes =

   sha256(

    new Uint8Array([
      ...keyBytes,
      2
    ])
   );

  return {

   messageKey:

    encodeBase64(
     messageKeyBytes
    ),

   nextChainKey:

    encodeBase64(
     nextChainKeyBytes
    )
  };
};

export const deriveMessageKey = (
 sharedSecret
) => {

 const hash =
  sha256(
   decodeBase64(sharedSecret)
  );

 return hash;
};

export const encryptMessage = (
 plaintext,
 sharedSecret
) => {

 const key =
  deriveMessageKey(
   sharedSecret
  );

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
   key
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
 sharedSecret
) => {

 const key =
  deriveMessageKey(
   sharedSecret
  );

 const plain =
  nacl.secretbox.open(
   decodeBase64(cipherText),
   decodeBase64(nonce),
   key
  );

 if (!plain) {
  throw new Error(
   "Decryption failed"
  );
 }

 return new TextDecoder()
  .decode(plain);
};
