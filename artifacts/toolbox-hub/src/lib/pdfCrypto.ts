/**
 * Real PDF RC4 encryption / decryption for Standard Security Handler (V1/V2, R2/R3).
 * Produces text-based (selectable, searchable) PDFs.
 * AES-encrypted PDFs (V≥4 / R≥4) are not supported — callers must fall back.
 *
 * References: PDF Reference 1.7 §7.6.3 and §7.6.4
 */

import SparkMD5 from 'spark-md5';
import {
  PDFDocument,
  PDFRawStream,
  PDFRef,
  PDFName,
  PDFNumber,
  PDFHexString,
  PDFString,
  PDFArray,
  PDFDict,
} from 'pdf-lib';

// ── Standard PDF password padding bytes (PDF §7.6.3.3) ──────────────────────
const PDF_PAD = new Uint8Array([
  0x28,0xBF,0x4E,0x5E,0x4E,0x75,0x8A,0x41,
  0x64,0x00,0x4E,0x56,0xFF,0xFA,0x01,0x08,
  0x2E,0x2E,0x00,0xB6,0xD0,0x68,0x3E,0x80,
  0x2F,0x0C,0xA9,0xFE,0x64,0x53,0x69,0x7A,
]);

// ── RC4 stream cipher ────────────────────────────────────────────────────────
function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff;
    [S[i], S[j]] = [S[j], S[i]];
  }
  const out = new Uint8Array(data.length);
  let i = 0;
  j = 0;
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 0xff;
    j = (j + S[i]) & 0xff;
    [S[i], S[j]] = [S[j], S[i]];
    out[k] = data[k] ^ S[(S[i] + S[j]) & 0xff];
  }
  return out;
}

// ── MD5 via spark-md5 ─────────────────────────────────────────────────────────
function md5(data: Uint8Array): Uint8Array {
  const buf =
    data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
      ? data.buffer
      : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const h = new (SparkMD5 as any).ArrayBuffer();
  h.append(buf);
  const hex: string = h.end();
  const result = new Uint8Array(16);
  for (let i = 0; i < 16; i++) result[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return result;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

function padPassword(pw: string): Uint8Array {
  const enc = new TextEncoder().encode(pw);
  const out = new Uint8Array(32);
  const n = Math.min(enc.length, 32);
  out.set(enc.slice(0, n));
  if (n < 32) out.set(PDF_PAD.slice(0, 32 - n), n);
  return out;
}

function pdfStringBytes(val: unknown): Uint8Array {
  if (val instanceof PDFHexString) return val.asBytes();
  if (val instanceof PDFString) {
    const s = val.asString();
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
    return b;
  }
  return new Uint8Array(0);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Key derivation (PDF §7.6.3.3) ────────────────────────────────────────────

/** Per-object encryption key using the master key + object number/generation */
function objectKey(masterKey: Uint8Array, objNum: number, genNum: number): Uint8Array {
  const extra = new Uint8Array([
    objNum & 0xff, (objNum >> 8) & 0xff, (objNum >> 16) & 0xff,
    genNum & 0xff, (genNum >> 8) & 0xff,
  ]);
  return md5(concat(masterKey, extra)).slice(0, Math.min(masterKey.length + 5, 16));
}

/** Derive the master encryption key from a user password and encrypt params */
function deriveEncryptionKey(
  password: string,
  revision: number,
  keyLen: number,
  O: Uint8Array,
  P: number,
  fileId: Uint8Array,
): Uint8Array {
  const pLe = new Uint8Array(4);
  new DataView(pLe.buffer).setInt32(0, P, true); // little-endian
  let key = md5(concat(padPassword(password), O, pLe, fileId.slice(0, 16)));
  if (revision >= 3) for (let i = 0; i < 50; i++) key = md5(key.slice(0, keyLen));
  return key.slice(0, keyLen);
}

/** Compute /O value (owner password entry) for a new encrypted PDF */
function computeO(userPw: string, ownerPw: string, revision: number, keyLen: number): Uint8Array {
  const opPadded = padPassword(ownerPw || userPw);
  let ownerKey = md5(opPadded);
  if (revision >= 3) for (let i = 0; i < 50; i++) ownerKey = md5(ownerKey.slice(0, keyLen));
  ownerKey = ownerKey.slice(0, keyLen);
  let result = rc4(ownerKey, padPassword(userPw));
  if (revision >= 3) for (let i = 1; i <= 19; i++) result = rc4(ownerKey.map(b => b ^ i), result);
  return result;
}

/** Compute /U value (user password verification hash) for a new encrypted PDF */
function computeU(encKey: Uint8Array, revision: number, fileId: Uint8Array): Uint8Array {
  if (revision < 3) return rc4(encKey, PDF_PAD);
  let u = rc4(encKey, md5(concat(PDF_PAD, fileId.slice(0, 16))));
  for (let i = 1; i <= 19; i++) u = rc4(encKey.map(b => b ^ i), u);
  const out = new Uint8Array(32);
  out.set(u);
  return out;
}

// ── Encrypt parameters extraction ────────────────────────────────────────────

export interface PdfEncryptParams {
  V: number;
  revision: number;
  keyLen: number; // in bytes
  O: Uint8Array;
  P: number;
  fileId: Uint8Array;
}

/**
 * Extract encryption parameters from a pdf-lib document loaded with
 * `{ ignoreEncryption: true }`. Returns null if the PDF is not Standard-encrypted
 * or if V≥4 (AES — caller should fall back).
 */
export function extractEncryptParams(pdfDoc: PDFDocument): PdfEncryptParams | null {
  const ctx = pdfDoc.context;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ti = ctx.trailerInfo as any;
  const encryptVal = ti.Encrypt;
  if (!encryptVal) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const encDict = ctx.lookup(encryptVal) as any;
  if (!encDict?.get) return null;

  const filter = encDict.get(PDFName.of('Filter'));
  if (!(filter instanceof PDFName) || filter.asString() !== 'Standard') return null;

  const V   = (encDict.get(PDFName.of('V'))      as PDFNumber | undefined)?.asNumber() ?? 1;
  const R   = (encDict.get(PDFName.of('R'))      as PDFNumber | undefined)?.asNumber() ?? 2;
  if (V >= 4) return null; // AES: not supported, caller falls back to image-based

  const O      = pdfStringBytes(encDict.get(PDFName.of('O')));
  const P      = (encDict.get(PDFName.of('P')) as PDFNumber | undefined)?.asNumber() ?? -4;
  const rawLen = (encDict.get(PDFName.of('Length')) as PDFNumber | undefined)?.asNumber()
                 ?? (V === 2 ? 128 : 40);
  const keyLen = rawLen / 8;

  // Extract file ID from trailer (first element of /ID array)
  let fileId = new Uint8Array(16);
  const idVal = ti.ID;
  if (idVal) {
    const arr = (idVal instanceof PDFArray) ? idVal
              : (ctx.lookup(idVal) as PDFArray | null);
    if (arr instanceof PDFArray) {
      const first = arr.get(0);
      if (first) fileId = new Uint8Array(pdfStringBytes(first));
    }
  }

  return { V, revision: R, keyLen, O, P, fileId };
}

// ── Stream-level RC4 transform (same function for encrypt and decrypt) ───────

function transformStreams(pdfDoc: PDFDocument, masterKey: Uint8Array): void {
  for (const [ref, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) {
      const r = ref as PDFRef;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj as any).contents = rc4(
        objectKey(masterKey, r.objectNumber, r.generationNumber),
        obj.contents,
      );
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Decrypt an RC4-encrypted PDF (Standard V1/V2, R2/R3).
 * Returns null for AES-encrypted PDFs (V≥4) — caller must fall back.
 * Password is assumed correct (validate with pdfjs-dist beforehand).
 */
export async function unlockPdf(
  bytes: ArrayBuffer,
  password: string,
): Promise<Uint8Array | null> {
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const params = extractEncryptParams(pdfDoc);

  if (!params) {
    // Not encrypted or non-Standard — save as-is
    return pdfDoc.save();
  }
  if (params.V >= 4) return null; // AES: caller uses image fallback

  const masterKey = deriveEncryptionKey(
    password, params.revision, params.keyLen, params.O, params.P, params.fileId,
  );

  transformStreams(pdfDoc, masterKey);

  // Remove /Encrypt so pdf-lib saves without the encryption marker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (pdfDoc.context.trailerInfo as any).Encrypt;

  return pdfDoc.save({ useObjectStreams: false });
}

/**
 * Encrypt an unprotected PDF with RC4-128 (Standard V2, R3).
 * Always produces a text-based encrypted PDF — no image rendering needed.
 * Permission bits follow PDF §7.6.3.2:
 *   printing: bit 3 (low-quality) + bit 12 (high-quality)
 *   copying:  bit 5 (copy text) + bit 10 (extract for accessibility)
 *   editing:  bit 4 (modify) + bit 6 (annotations) + bit 11 (assemble)
 */
export async function protectPdf(
  bytes: ArrayBuffer,
  userPw: string,
  ownerPw: string,
  permissions: { printing: boolean; copying: boolean; editing: boolean },
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes);
  const ctx = pdfDoc.context;

  const revision = 3;
  const keyLen   = 16; // 128-bit RC4

  // Start with all permissions set, clear restricted bits.
  // 0xFFFFFF3C = bits 1-2 and 7-8 cleared (reserved), bits 3-12 set, bits 13-32 set.
  let P = -196; // 0xFFFFFF3C as signed int32
  if (permissions.printing) P &= ~(4 | 2048);    // bits 3, 12
  if (permissions.copying)  P &= ~(16 | 512);    // bits 5, 10
  if (permissions.editing)  P &= ~(8 | 32 | 1024); // bits 4, 6, 11

  // Random 16-byte file ID
  const fileId = crypto.getRandomValues(new Uint8Array(16));

  // Compute /O and /U security hashes
  const O         = computeO(userPw, ownerPw, revision, keyLen);
  const masterKey = deriveEncryptionKey(userPw, revision, keyLen, O, P, fileId);
  const U         = computeU(masterKey, revision, fileId);

  // Encrypt all existing streams before serialising
  transformStreams(pdfDoc, masterKey);

  // Build /Encrypt dictionary and register it as an indirect object
  const encDictObj = ctx.obj({
    Filter: 'Standard',
    V: 2,
    R: revision,
    Length: keyLen * 8,
    P,
  }) as PDFDict;
  encDictObj.set(PDFName.of('O'), PDFHexString.of(toHex(O)));
  encDictObj.set(PDFName.of('U'), PDFHexString.of(toHex(U)));

  const encRef = ctx.register(encDictObj);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.trailerInfo as any).Encrypt = encRef;

  // /ID is required when encryption is present
  const idHex = toHex(fileId);
  const idArr = ctx.obj([PDFHexString.of(idHex), PDFHexString.of(idHex)]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.trailerInfo as any).ID = idArr;

  // useObjectStreams:false ensures every object has its own stable objNum for keying
  return pdfDoc.save({ useObjectStreams: false });
}
