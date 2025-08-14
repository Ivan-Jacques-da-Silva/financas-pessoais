// lib/firebase.ts
import { initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyBVFpTLGhvMd1blqZ3Wy1T5xwVkB8_Bbbk",
  authDomain: "contas-722e7.firebaseapp.com",
  projectId: "contas-722e7",
  storageBucket: "contas-722e7.appspot.com",
  messagingSenderId: "809994224586",
  appId: "1:809994224586:web:39dcd48514580745fd8533",
  measurementId: "G-W0TK49RTKD"
}

export const app = initializeApp(firebaseConfig)
