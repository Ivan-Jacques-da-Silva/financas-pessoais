import * as CryptoJS from "crypto-js"
const CHAVE_SECRETA = "e82@#fdH17z!pLk39$xa"


export function criptografar(dado: any) {
  const json = JSON.stringify(dado)
  return CryptoJS.AES.encrypt(json, CHAVE_SECRETA).toString()
}

export function descriptografar(dadoCriptografado: string) {
  const bytes = CryptoJS.AES.decrypt(dadoCriptografado, CHAVE_SECRETA)
  const texto = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(texto)
}
