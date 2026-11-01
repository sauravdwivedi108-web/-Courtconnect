#!/usr/bin/env node
/*
 * mkiso.mjs — build a bootable ISO9660 image with El Torito (no external tools).
 * Usage: node tools/mkiso.mjs <rootDir> <outIso>
 * Boot layout expected in rootDir:
 *   boot/isolinux/isolinux.bin
 *   boot/isolinux/isolinux.cfg
 *   vmlinuz        (kernel)
 *   initramfs      (initrd)
 * The boot catalog is generated automatically (boot/isolinux/boot.cat).
 */
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.argv[2];
const out = process.argv[3];
if (!root || !out) {
  console.error("usage: node tools/mkiso.mjs <rootDir> <outIso>");
  process.exit(1);
}

const SECTOR = 2048;
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
const pad = (buf, n) => {
  const r = n - (buf.length % n);
  return r === n ? buf : Buffer.concat([buf, Buffer.alloc(r)]);
};
const both = (n) => {
  const b = Buffer.alloc(8);
  b.writeUInt32LE(n >>> 0, 0);
  b.writeUInt32BE(n >>> 0, 4);
  return b;
};

/* ---------- walk root ---------- */
const files = []; // {rel, abs, data}
const dirs = new Set();
async function walk(dir, base) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = join(dir, e.name);
    const rel = join(base, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) {
      dirs.add(rel);
      await walk(abs, rel);
    } else {
      files.push({ rel, abs });
    }
  }
}
await walk(root, "");
dirs.add("");
const sortedDirs = [...dirs].sort().reverse(); // children before parents when allocating

/* ---------- extent allocator ---------- */
let lba = 19; // after PVD+BRVD+terminator
const alloc = (bytes) => {
  const sectors = Math.ceil(bytes / SECTOR);
  const start = lba;
  lba += sectors;
  return { start, sectors };
};

/* data extents */
const fileData = new Map();
for (const f of files) {
  const data = await readFile(f.abs);
  const ext = alloc(data.length);
  fileData.set(f.rel, { data, ext });
}

/* boot catalog + isolinux boot image extents (image file is already in files) */
const bootBin = fileData.get("boot/isolinux/isolinux.bin");
if (!bootBin) { console.error("missing boot/isolinux/isolinux.bin"); process.exit(1); }
const bootCatSector = alloc(SECTOR).start;
const bootCat = Buffer.alloc(SECTOR);
{
  const id = Buffer.from("COURTCONNECT", "latin1");
  id.copy(bootCat, 2, 0, Math.min(id.length, 24));
  /* validation entry: header 0 0xAA, platform 0, reserved 0, id, checksum, 55 AA */
  bootCat.writeUInt8(0, 0);
  bootCat.writeUInt8(0xaa, 1);
  // checksum: sum of 16-bit words must be 0
  bootCat.writeUInt16LE(0, 28);
  bootCat.writeUInt8(0x55, 30);
  bootCat.writeUInt8(0xaa, 31);
  let sum = 0;
  for (let i = 0; i < 32; i += 2) sum += bootCat.readUInt16LE(i);
  bootCat.writeUInt16LE((-sum) & 0xffff, 28);
  /* default entry */
  const off = 32;
  bootCat.writeUInt8(0x88, off);           // boot indicator
  bootCat.writeUInt8(0, off + 1);          // media type: no emulation
  bootCat.writeUInt16LE(0, off + 2);       // load segment
  bootCat.writeUInt8(0, off + 4);          // system type
  bootCat.writeUInt8(0, off + 5);          // unused
  bootCat.writeUInt16LE(4, off + 6);       // sector count
  bootCat.writeUInt32LE(bootBin.ext.start, off + 8); // load RBA
}

/* directories: allocate after files */
const dirExt = new Map();
for (const d of sortedDirs) {
  dirExt.set(d, alloc(SECTOR)); // generous, recalc later
}

/* ---------- record builders ---------- */
function dirRecord(name, extLba, size, flags, date) {
  const nameBuf = Buffer.from(name, "latin1");
  const rec = Buffer.alloc(33 + nameBuf.length + 1);
  rec.writeUInt8(33 + nameBuf.length, 0); // length
  rec.writeUInt8(0, 1);
  both(extLba).copy(rec, 2);
  both(size).copy(rec, 10);
  date.copy(rec, 18);
  rec.writeUInt8(flags, 25);
  rec.writeUInt8(0, 26);
  rec.writeUInt8(0, 27);
  both(1).copy(rec, 28);
  rec.writeUInt8(nameBuf.length, 32);
  nameBuf.copy(rec, 33);
  return pad(rec, 2);
}

const dateNow = new Date();
const recDate = Buffer.alloc(7);
{
  const d = dateNow;
  recDate.writeUInt8(d.getFullYear() - 1900, 0);
  recDate.writeUInt8(d.getMonth() + 1, 1);
  recDate.writeUInt8(d.getDate(), 2);
  recDate.writeUInt8(d.getHours(), 3);
  recDate.writeUInt8(d.getMinutes(), 4);
  recDate.writeUInt8(d.getSeconds(), 5);
  recDate.writeInt8((d.getTimezoneOffset() / 15) * -1, 6);
}

const rootName = "\u0000";
function buildDirRecord(dir) {
  /* "." and "..", then children (dirs then files) */
  const children = [];
  for (const d of dirs) {
    if (d === dir) continue;
    const parent = d.slice(0, d.lastIndexOf("/"));
    if (parent === dir) children.push({ kind: "dir", name: d.slice(d.lastIndexOf("/") + 1), path: d });
  }
  for (const f of files) {
    const parent = f.rel.includes("/") ? f.rel.slice(0, f.rel.lastIndexOf("/")) : "";
    if (parent === dir) children.push({ kind: "file", name: f.rel.slice(f.rel.lastIndexOf("/") + 1), path: f.rel });
  }
  children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
    return a.name < b.name ? -1 : 1;
  });
  const recs = [dirRecord("\u0000", dirExt.get(dir).start, dirExt.get(dir).sectors * SECTOR, 0x02, recDate)];
  const parentDir = dir.includes("/") ? dir.slice(0, dir.lastIndexOf("/")) : "";
  recs.push(dirRecord("\u0001", dirExt.get(parentDir).start, dirExt.get(parentDir).sectors * SECTOR, 0x02, recDate));
  for (const c of children) {
    if (c.kind === "dir") {
      recs.push(dirRecord(c.name, dirExt.get(c.path).start, dirExt.get(c.path).sectors * SECTOR, 0x02, recDate));
    } else {
      const meta = fileData.get(c.path);
      recs.push(dirRecord(c.name, meta.ext.start, meta.data.length, 0, recDate));
    }
  }
  return Buffer.concat(recs);
}

/* compute directory sizes, then reallocate to exact sizes */
for (const d of sortedDirs) {
  const rec = buildDirRecord(d);
  const need = Math.ceil(rec.length / SECTOR);
  if (need !== dirExt.get(d).sectors) {
    dirExt.set(d, { start: dirExt.get(d).start, sectors: need });
  }
}
/* simpler: rebuild exact after first pass sizes */
for (const d of sortedDirs) {
  const rec = buildDirRecord(d);
  const need = Math.ceil(rec.length / SECTOR);
  dirExt.set(d, { start: dirExt.get(d).start, sectors: need });
}

/* ---------- path tables ---------- */
const pathEntries = []; // {name, parent, ext}
const pathIndex = new Map();
{
  const ordered = [""].concat([...dirs].filter(d => d !== "").sort());
  ordered.forEach((d, i) => pathIndex.set(d, i + 1));
  for (const d of ordered) {
    const parent = d.includes("/") ? d.slice(0, d.lastIndexOf("/")) : "";
    const name = d === "" ? "\u0000" : d.slice(d.lastIndexOf("/") + 1);
    pathEntries.push({ name, parent: pathIndex.get(parent), ext: dirExt.get(d) });
  }
}
const ptEntry = (e, le) => {
  const n = Buffer.from(e.name, "latin1");
  const b = Buffer.alloc(8 + n.length);
  b.writeUInt8(8 + n.length, 0);
  b.writeUInt8(0, 1);
  le ? b.writeUInt32LE(e.ext.start, 2) : b.writeUInt32BE(e.ext.start, 2);
  le ? b.writeUInt16LE(e.parent, 6) : b.writeUInt16BE(e.parent, 6);
  n.copy(b, 8);
  return pad(b, 2);
};
const ptL = Buffer.concat(pathEntries.map(e => ptEntry(e, true)));
const ptM = Buffer.concat(pathEntries.map(e => ptEntry(e, false)));
const ptLExt = alloc(ptL.length);
const ptMExt = alloc(ptM.length);

/* ---------- volume descriptor ---------- */
const rootRec = buildDirRecord("");
const pvd = Buffer.alloc(SECTOR);
{
  pvd.writeUInt8(1, 0);
  pvd.write("CD001", 1, "ascii");
  pvd.writeUInt8(1, 6);
  pvd.write("COURTCONNECT", 8, "ascii"); // system identifier (32)
  pvd.write("COURTCONNECT_OFFLINE", 40, "ascii"); // volume id (32)
  pvd.writeUInt32LE(lba, 80); // volume space size
  pvd.writeUInt32BE(lba, 84);
  pvd.writeUInt16LE(1, 120);
  pvd.writeUInt16BE(1, 122);
  pvd.writeUInt16LE(1, 124);
  pvd.writeUInt16BE(1, 126);
  pvd.writeUInt16LE(SECTOR, 128);
  pvd.writeUInt16BE(SECTOR, 130);
  pvd.writeUInt32LE(ptL.length, 132); pvd.writeUInt32BE(ptL.length, 136);
  pvd.writeUInt32LE(ptLExt.start, 140); pvd.writeUInt32BE(ptLExt.start, 144);
  pvd.writeUInt32LE(0, 148); pvd.writeUInt32BE(0, 152);
  pvd.writeUInt32LE(ptMExt.start, 156); pvd.writeUInt32BE(ptMExt.start, 160);
  pvd.writeUInt32LE(0, 164); pvd.writeUInt32BE(0, 168);
  rootRec.copy(pvd, 190, 0, 34);
  pvd.write("COURTCONNECT", 318, "ascii"); // volume set id (128)
  pvd.write("COURTCONNECT", 446, "ascii"); // publisher (128)
  pvd.write("", 574, "ascii"); // preparer
  pvd.write("COURTCONNECT", 702, "ascii"); // application (128)
  const ts = (d) => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}${String(d.getSeconds()).padStart(2,"0")}00`;
  pvd.write(ts(dateNow), 813, "ascii");
  pvd.write(ts(dateNow), 830, "ascii");
  pvd.write("00000000000000000000", 847, "ascii");
  pvd.write("00000000000000000000", 864, "ascii");
  pvd.writeUInt8(1, 881);
}

const brvd = Buffer.alloc(SECTOR);
{
  brvd.writeUInt8(0, 0);
  brvd.write("CD001", 1, "ascii");
  brvd.writeUInt8(1, 6);
  brvd.write("EL TORITO SPECIFICATION", 7, "ascii");
  brvd.writeUInt32LE(bootCatSector, 71);
}
const terminator = Buffer.alloc(SECTOR);
terminator.writeUInt8(255, 0);
terminator.write("CD001", 1, "ascii");
terminator.writeUInt8(1, 6);

/* ---------- assemble image ---------- */
const image = Buffer.alloc(lba * SECTOR);
const writeAt = (l, buf) => {
  const bytes = Buffer.from(buf);
  if ((l + Math.ceil(bytes.length / SECTOR)) * SECTOR > image.length) {
    throw new Error("ISO overflow at LBA " + l + " size " + bytes.length);
  }
  bytes.copy(image, l * SECTOR);
};
writeAt(16, brvd);
writeAt(17, pvd);
writeAt(18, terminator);
for (const f of files) {
  const meta = fileData.get(f.rel);
  writeAt(meta.ext.start, pad(meta.data, SECTOR));
}
for (const d of sortedDirs) {
  writeAt(dirExt.get(d).start, pad(buildDirRecord(d), SECTOR));
}
writeAt(ptLExt.start, pad(ptL, SECTOR));
writeAt(ptMExt.start, pad(ptM, SECTOR));
writeAt(bootCatSector, bootCat);

await writeFile(out, image);
console.log(`ISO written: ${out} (${image.length} bytes, ${lba} sectors)`);
