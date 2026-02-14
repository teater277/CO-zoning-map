# Deployment Checklist - Colorado Zoning Atlas

## ✅ Completed Steps

- [x] **Step 1:** Created `prepare_tiles.py` script
- [x] **Step 1:** Generated trimmed GeoJSON (170.9 MB, 48.9% reduction)
- [x] **Step 4:** Created web frontend files
  - [x] `index.html` - Main page with MapLibre GL JS
  - [x] `css/style.css` - Styling for map, legend, popups
  - [x] `js/app.js` - Map initialization, PMTiles, interactions
  - [x] `README.md` - Complete documentation
  - [x] `.gitignore` - Git ignore file
  - [x] `generate_tiles.sh` - Automated tile generation script

## ⏳ Remaining Steps

### Step 2: Install WSL + Tools (One-Time Setup)

**Check WSL status:**
```powershell
wsl --list --verbose
```

**If not installed, run in PowerShell as Administrator:**
```powershell
wsl --install
```
Then restart computer.

**Install tippecanoe and pmtiles (in WSL Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y tippecanoe

curl -L https://github.com/protomaps/go-pmtiles/releases/latest/download/go-pmtiles_Linux_x86_64.tar.gz | tar xz
sudo mv pmtiles /usr/local/bin/
```

### Step 3: Generate Vector Tiles

**Option A: Use the automated script (recommended)**

From WSL Ubuntu terminal:
```bash
cd /mnt/c/Users/luket/OneDrive/Desktop/Claude\ Projects/Map\ Endpoint/web
bash generate_tiles.sh
```

**Option B: Run commands manually**

From WSL Ubuntu terminal:
```bash
cd /mnt/c/Users/luket/OneDrive/Desktop/Claude\ Projects/Map\ Endpoint

# Generate MBTiles
tippecanoe \
  -o web/data/colorado_zoning.mbtiles \
  -Z8 -z14 \
  --layer=zoning \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --force \
  web/data/colorado_zoning_trimmed.geojson

# Convert to PMTiles
pmtiles convert web/data/colorado_zoning.mbtiles web/data/colorado_zoning.pmtiles

# Cleanup
rm web/data/colorado_zoning.mbtiles
```

**Expected result:** `web/data/colorado_zoning.pmtiles` (~30-60 MB)

### Step 4: Test Locally

From the `web/` directory:
```bash
python -m http.server 8000
```

Open http://localhost:8000 and verify:
- [ ] Map loads centered on Denver
- [ ] Colored parcels render
- [ ] Legend displays (bottom-right)
- [ ] Click parcel shows popup with zoning details
- [ ] Hover effect highlights parcels
- [ ] Zoom in/out loads new tiles smoothly

### Step 5: Deploy to GitHub Pages

**1. Create GitHub repository:**
- Go to https://github.com/new
- Repository name: `colorado-zoning-map` (or your choice)
- Public repository
- Do NOT initialize with README

**2. Initialize git and push:**

From PowerShell/Git Bash in `web/` directory:
```bash
cd web

git init
git add .
git commit -m "Initial Colorado zoning web map with vector tiles"

# Replace USERNAME with your GitHub username
git remote add origin https://github.com/USERNAME/colorado-zoning-map.git

git branch -M main
git push -u origin main
```

**3. Enable GitHub Pages:**
- Go to repository Settings → Pages
- Source: Branch `main`, folder `/ (root)`
- Click Save

**4. Verify deployment:**
- Wait 1-2 minutes for build
- Visit https://USERNAME.github.io/colorado-zoning-map/
- Test all functionality

## Quick Reference

### File Sizes
- Original GeoJSON: 334.4 MB
- Trimmed GeoJSON: 170.9 MB (48.9% reduction)
- PMTiles (target): ~30-60 MB (suitable for GitHub Pages)

### Technology Stack
- **MapLibre GL JS 4.7.1** - Map rendering
- **PMTiles 3.2.0** - Vector tile format
- **Tippecanoe** - Tile generation
- **GitHub Pages** - Free hosting

### Key Files
- `data/colorado_zoning_trimmed.geojson` - Source data
- `data/colorado_zoning.pmtiles` - Vector tiles (to be generated)
- `index.html` - Main page
- `js/app.js` - Map logic
- `css/style.css` - Styling

### Dataset Info
- **59,832 parcels** across **26 Colorado jurisdictions**
- Zoning types: Residential (R), Mixed/Commercial (M), Special Purpose (X), Overlay (O), Unclassified (U)
- Data includes: lot sizes, parking requirements, height limits, housing types allowed

## Troubleshooting

**WSL not installing:**
- Must run PowerShell as Administrator
- Need Windows 10 version 2004+ or Windows 11
- Try `wsl --install -d Ubuntu`

**Tippecanoe errors:**
- Must run in WSL Linux, not Windows
- Check available memory (tippecanoe can be memory-intensive)
- Try reducing max zoom: `-z12` instead of `-z14`

**PMTiles not loading in browser:**
- Must use HTTP server (file:// URLs don't work)
- Check browser console for errors
- Verify PMTiles file exists and is not corrupted

**GitHub Pages not updating:**
- Check Actions tab for build status
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Wait 2-3 minutes after push

## Support

- National Zoning Atlas: https://www.zoningatlas.org
- MapLibre GL JS Docs: https://maplibre.org/maplibre-gl-js/docs/
- PMTiles Docs: https://docs.protomaps.com/pmtiles/
- Tippecanoe GitHub: https://github.com/felt/tippecanoe
