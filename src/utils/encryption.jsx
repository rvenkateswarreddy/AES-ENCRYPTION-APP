// utils/encryption.js
import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';

// Manually override the random number generator
CryptoJS.lib.WordArray.random = function (nBytes) {
  const words = [];
  const rnd = nBytes => {
    const array = new Uint8Array(nBytes);
    window.crypto.getRandomValues(array); // Use the polyfilled crypto
    return array;
  };
  for (let i = 0; i < nBytes; i += 4) {
    words.push(rnd(4));
  }
  return CryptoJS.lib.WordArray.create(words, nBytes);
};

const SECRET_KEY = 'your-super-secret-key'; // Replace with a secure key

export const encrypt = text => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decrypt = ciphertext => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
