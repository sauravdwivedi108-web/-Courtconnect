#!/usr/bin/env python3
"""
build-drafts.py — scan the drafts-library, convert RTF/DOCX to plain text,
and emit per-category JSON + a global catalog for the Drafting Desk filter.
Usage: python tools/build-drafts.py
"""
import json, os, re, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "drafts-library"
OUT_JSON = ROOT / "assets" / "drafts"
CATALOG = ROOT / "assets" / "js" / "drafts-catalog.js"

RTF_GROUP = re.compile(r'[{}]')
RTF_CTRL = re.compile(r'\\([a-zA-Z]+)(-?\d+)? ?')
RTF_ESC = re.compile(r'\\([\\{}])')

# metadata groups whose entire content should be skipped
RTF_SKIP_GROUPS = {
    "*", "fonttbl", "colortbl", "stylesheet", "info", "generator",
    "themedata", "colorschememapping", "listtable", "listoverridetable",
    "latentstyles", "rsidtbl", "mmathPr", "xmlnstbl", "datastore",
    "bkmkstart", "bkmkend", "annotation", "nonshdt", "shp", "dntblnsb",
    "result", "pntext", "pn", "datafield", "field", "fldinst", "fldrslt",
    "object", "pict", "file", "background", "shading", "revtbl",
}

def keep_rtf_text(raw: str) -> str:
    out = []
    i = 0
    n = len(raw)

    def skip_balanced(start):
        depth = 1
        j = start
        while j < n and depth:
            c = raw[j]
            if c == "\\" and j + 1 < n and raw[j + 1] in "{}":
                j += 2
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            j += 1
        return j

    while i < n:
        ch = raw[i]
        if ch == "\\":
            m = RTF_ESC.match(raw, i)
            if m:
                out.append(m.group(1))
                i = m.end()
                continue
            m = RTF_CTRL.match(raw, i)
            if m:
                word, num = m.group(1), m.group(2)
                if word in ("par", "line", "sect", "page"):
                    out.append("\n")
                elif word == "tab":
                    out.append("\t")
                elif word == "u":
                    if num:
                        try:
                            out.append(chr(int(num) & 0xFFFF))
                        except (ValueError, OverflowError):
                            pass
                        if m.end() < n and raw[m.end()] == "?":
                            i = m.end() + 1
                            continue
                i = m.end()
                continue
            i += 1
            continue
        if ch == "{":
            # look at first control word inside the group to decide skip
            nxt = i + 1
            if nxt < n and raw[nxt] == "\\":
                skip = False
                if nxt + 1 < n and raw[nxt + 1] == "*":
                    skip = True
                else:
                    m = RTF_CTRL.match(raw, nxt)
                    if m and m.group(1) in RTF_SKIP_GROUPS:
                        skip = True
                if skip:
                    i = skip_balanced(nxt)
                    continue
            i += 1
            continue
        if ch == "}":
            i += 1
            continue
        out.append(ch)
        i += 1
    text = "".join(out)
    text = re.sub(r'\n{3,}', "\n\n", text)
    return text.strip()

def rtf_to_text(raw: str) -> str:
    return keep_rtf_text(raw)

def docx_to_text(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as z:
            xml = z.read("word/document.xml").decode("utf-8", "replace")
    except Exception:
        return ""
    # paragraphs
    xml = re.sub(r'</w:p>', "\n", xml)
    # keep only w:t contents
    parts = []
    for tok in re.split(r'(<w:t[^>]*>|</w:t>)', xml):
        if tok.startswith("<w:t"):
            continue
        if tok.startswith("</w:t"):
            continue
        if tok == "\n":
            parts.append("\n")
        else:
            parts.append(tok)
    text = "".join(parts)
    text = re.sub(r'<[^>]+>', "", text)
    text = re.sub(r'\n{3,}', "\n\n", text)
    return text.strip()

def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

def main():
    OUT_JSON.mkdir(parents=True, exist_ok=True)
    catalog = []
    total = 0
    cats = sorted([d for d in LIB.iterdir() if d.is_dir()], key=lambda d: d.name.lower())
    for cat in cats:
        files = sorted([f for f in cat.rglob("*") if f.is_file() and f.suffix.lower() in (".rtf", ".docx")], key=lambda f: f.name.lower())
        if not files:
            continue
        slug = slugify(cat.name)
        drafts = []
        for f in files:
            rel = f.relative_to(LIB).as_posix()
            if f.suffix.lower() == ".rtf":
                try:
                    raw = f.read_text(encoding="utf-8", errors="replace")
                except Exception:
                    raw = ""
                text = rtf_to_text(raw)
            else:
                text = docx_to_text(f)
            drafts.append({"title": f.stem, "file": rel, "text": text[:8000]})
        (OUT_JSON / f"{slug}.json").write_text(
            json.dumps({"category": cat.name, "slug": slug, "drafts": drafts}, ensure_ascii=False, indent=1),
            encoding="utf-8")
        catalog.append({"slug": slug, "title": cat.name, "count": len(drafts)})
        total += len(drafts)
        print(f"{cat.name}: {len(drafts)} drafts -> {slug}.json")
    js = "/* auto-generated by tools/build-drafts.py */\nwindow.DRAFTS_CATALOG = " + json.dumps(catalog, ensure_ascii=False) + ";\n"
    CATALOG.write_text(js, encoding="utf-8")
    print(f"\nTOTAL: {total} drafts, {len(catalog)} categories")

if __name__ == "__main__":
    main()
