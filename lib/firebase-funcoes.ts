// lib/firebase-funcoes.ts
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

// retorna a _string_ criptografada (ou null se não existir)
export async function carregarDadosFirebase(): Promise<string | null> {
  const ref = doc(db, "estadoApp", "dados");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    // o campo que você gravou chama-se `json` e já é uma string criptografada
    return snap.data().json as string;
  }
  return null;
}

// recebe a _string_ criptografada e grava no Firestore
export async function salvarDadosFirebase(encryptedState: string) {
  const ref = doc(db, "estadoApp", "dados");
  await setDoc(ref, {
    json: encryptedState
  });
}
