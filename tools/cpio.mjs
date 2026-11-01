#!/usr/bin/env node
/*
 * cpio.mjs — create a newc (SVR4) cpio archive from a directory.
 * Usage: node tools/cpio.mjs <rootDir> <outFile>
 * Used to build the initramfs for the CourtConnect offline ISO.
 */
import { readdir, stat, readFile, writeFile, lstat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.argv[2];
const out = process.argv[3];
const execListFile = process.argv[4];
if (!root || !out) {
  console.error("usage: node tools/cpio.mjs <rootDir> <outFile> [execList]");
  process.exit(1);
}

const execSet = new Set();
if (execListFile) {
  const fs = await import("node:fs");
  const list = fs.readFileSync(execListFile, "utf8");
  for (const line of list.split("\n")) {
    const p = line.trim();
    if (p) execSet.add(p.replace(/\\/g, "/"));
  }
}

const pad4 = (n) => (4 - (n % 4)) % 4;

function header(name, mode, size, mtime, ino, nlink, isSymlinkTarget) {
  const fields = [
    ino & 0xffffffff, mode, 0, 0, nlink, mtime & 0xffffffff,
    size, 0, 0, 0, 0, Buffer.byteLength(name) + 1, 0
  ];
  const b = Buffer.alloc(110);
  b.write("070701", 0, "ascii");
  let off = 6;
  for (const f of fields) {
    b.write(f.toString(16).padStart(8, "0"), off, "hex");
    off += 8;
  }
  const nameBuf = Buffer.from(name + "\0", "utf8");
  const hdr = Buffer.concat([b, nameBuf, Buffer.alloc(pad4(b.length + nameBuf.length))]);
  return hdr;
}

async function walk(dir, base, files) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    const rel = join(base, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) {
      await walk(full, rel, files);
      files.push({ rel: rel + "/", full, dir: true });
    } else {
      files.push({ rel, full, dir: false });
    }
  }
}

const files = [];
await walk(root, "", files);

const chunks = [];
let ino = 1;
for (const f of files) {
  const st = await lstat(f.full);
  const isLink = st.isSymbolicLink();
  const execFile = !f.dir && !isLink && execSet.has(f.rel);
  const mode = f.dir ? 0o40755 : isLink ? 0o120777 : execFile ? 0o100755 : 0o100644;
  let data = Buffer.alloc(0);
  if (isLink) {
    data = Buffer.from(await readFile(f.full, "utf8"), "utf8");
  } else if (!f.dir) {
    data = await readFile(f.full);
  }
  chunks.push(header(f.rel, mode, data.length, Math.floor(st.mtimeMs / 1000) || 0, ino++, 1, isLink));
  chunks.push(data);
  chunks.push(Buffer.alloc(pad4(data.length)));
}
chunks.push(header("TRAILER!!!", 0, 0, 0, ino, 1, false));

await writeFile(out, Buffer.concat(chunks));
console.log(`cpio written: ${out} (${files.length} entries)`);
