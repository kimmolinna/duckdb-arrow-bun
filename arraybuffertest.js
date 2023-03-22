import { ptr,toArrayBuffer } from "bun:ffi";
const size = 35000;
let myTypedArray = new Uint8Array(size);
const myPtr = ptr(myTypedArray);
console.log(myPtr)
const read = new Uint8Array(toArrayBuffer(myPtr, 0, size),0,size);
console.log(read);