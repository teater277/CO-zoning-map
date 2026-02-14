# Denver Metro Zoning Atlas - Web Map

## ⚠️ PROOF OF CONCEPT - INCOMPLETE COVERAGE

**Current Dataset:** Partial Denver metro area only
- **26 jurisdictions** in central Denver metro (Denver, Aurora, Lakewood, etc.)
- **~60,000 parcels**
- **Missing:** Boulder County, Douglas County, most outer suburbs, mountain areas, rest of Colorado

**Purpose:** Demonstrate the web map technology as proof of concept before expanding to:
1. Complete metro Denver (100+ jurisdictions)
2. All of Colorado (hundreds of jurisdictions, millions of parcels)

Interactive web map using vector tiles and MapLibre GL JS.

## Current Status

✅ **Step 1 Complete:** Trimmed GeoJSON created (170.9 MB, down from 334.4 MB)
✅ **Step 4 Complete:** Web frontend files created (HTML, CSS, JS)

⏳ **Next Steps:** Generate vector tiles and deploy

## Prerequisites

### Install WSL (Windows Subsystem for Linux)

Open PowerShell as Administrator and run:

```powershell
wsl --install
```

Restart your computer when prompted. After restart, Ubuntu will launch automatically to complete setup.

### Install tippecanoe and pmtiles (in WSL)

Open Ubuntu terminal and run:

```bash
# Update package list
sudo apt-get update

# Install tippecanoe
sudo apt-get install -y tippecanoe

# Install pmtiles CLI
curl -L https://github.com/protomaps/go-pmtiles/releases/latest/download/go-pmtiles_Linux_x86_64.tar.gz | tar xz
sudo mv pmtiles /usr/local/bin/

# Verify installations
tippecanoe --version
pmtiles --version
```

## Generate Vector Tiles

From WSL Ubuntu terminal:

```bash
# Navigate to project directory (adjust path if needed)
cd /mnt/c/Users/luket/OneDrive/Desktop/Claude\ Projects/Map\ Endpoint

# Generate MBTiles from trimmed GeoJSON
tippecanoe \
  -o web/data/colorado_zoning.mbtiles \
  -Z8 -z14 \
  --layer=zoning \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --force \
  web/data/colorado_zoning_trimmed.geojson

# Convert MBTiles to PMTiles
pmtiles convert web/data/colorado_zoning.mbtiles web/data/colorado_zoning.pmtiles

# Check file size (should be ~30-60 MB, well under GitHub's 100 MB limit)
ls -lh web/data/colorado_zoning.pmtiles

# Optional: Remove intermediate MBTiles file to save space
rm web/data/colorado_zoning.mbtiles
```

**Expected output:** `colorado_zoning.pmtiles` (~30-60 MB)

### Tippecanoe Options Explained

- `-o`: Output file path
- `-Z8`: Minimum zoom level (state-wide view)
- `-z14`: Maximum zoom level (detailed parcel view)
- `--layer=zoning`: Name of the vector tile layer
- `--drop-densest-as-needed`: Smart simplification to stay under tile size limits
- `--extend-zooms-if-still-dropping`: Add extra zoom levels if needed
- `--force`: Overwrite existing output file

## Test Locally

PMTiles requires HTTP range requests, so you can't open `index.html` directly (file:// URLs don't work).

### Option 1: Python HTTP Server

From the `web/` directory:

```bash
python -m http.server 8000
```

Then open: http://localhost:8000

### Option 2: Node.js HTTP Server

```bash
npx http-server -p 8000
```

Then open: http://localhost:8000

### What to Test

1. **Map loads:** Should see Colorado centered on Denver
2. **Tiles render:** Colored parcels should appear
3. **Legend displays:** Check bottom-right for color key
4. **Click interaction:** Click a parcel to see popup with zoning details
5. **Hover effect:** Parcels should highlight on mouseover
6. **Zoom levels:** Pan and zoom - new tiles should load smoothly
7. **Network tab:** Check DevTools Network tab for `colorado_zoning.pmtiles` range requests

## Deploy to GitHub Pages

### 1. Create GitHub Repository

Go to https://github.com/new and create a new repository (e.g., `colorado-zoning-map`)

**Important:** Do NOT initialize with README, .gitignore, or license (we already have files)

### 2. Initialize Git and Push

From PowerShell or Git Bash, in the `web/` directory:

```bash
cd web

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial Colorado zoning web map

- Interactive map with 59,832 zoning parcels across 26 jurisdictions
- Vector tiles (PMTiles) for efficient loading
- MapLibre GL JS for rendering
- Color-coded by zoning type with detailed popups
- Data from National Zoning Atlas"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/colorado-zoning-map.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

GitHub will build your site. After ~1 minute, it will be live at:

**https://USERNAME.github.io/colorado-zoning-map/**

### 4. Verify Deployment

- Open the GitHub Pages URL
- Check that tiles load correctly
- Test click interactions
- Verify legend and popups work

## File Structure

```
web/
├── index.html              # Main page
├── css/
│   └── style.css          # Map styling, legend, popups
├── js/
│   └── app.js             # Map logic, PMTiles, interactions
├── data/
│   ├── colorado_zoning_trimmed.geojson  # Source data (170.9 MB)
│   └── colorado_zoning.pmtiles          # Vector tiles (~30-60 MB)
└── README.md              # This file
```

## Technologies Used

- **MapLibre GL JS 4.7.1** - Open-source map rendering engine
- **PMTiles 3.2.0** - Single-file vector tile archive format
- **Tippecanoe** - Vector tile generator from Mapbox
- **GeoJSON** - Source data format
- **GitHub Pages** - Free static hosting

## Data Attribution

Data sourced from the [National Zoning Atlas](https://www.zoningatlas.org) - a comprehensive database of zoning regulations across the United States.

## Troubleshooting

### Tiles not loading
- Check browser console for errors
- Verify `colorado_zoning.pmtiles` exists in `web/data/`
- Confirm you're using an HTTP server (not file://)
- Check Network tab for 404 errors

### Map is blank
- Check console for PMTiles protocol errors
- Verify PMTiles file size is reasonable (~30-60 MB)
- Try refreshing with cache cleared (Ctrl+Shift+R)

### Tippecanoe fails
- Confirm you're running in WSL, not Windows PowerShell
- Check that input GeoJSON exists and is valid
- Try reducing max zoom level if memory issues occur

### GitHub Pages not updating
- Wait 1-2 minutes for build to complete
- Check Actions tab for build status
- Hard refresh browser (Ctrl+Shift+R)
- Verify correct branch and folder in Settings → Pages

## Next Steps / Enhancements

Possible future improvements:

- Add search by address/jurisdiction
- Filter by zoning type or housing type
- Compare multiple jurisdictions side-by-side
- Export filtered data as CSV
- Mobile-responsive improvements
- Add basemap layer (satellite, streets)
- Jurisdiction boundary outlines
- Statistics dashboard

## License

Data: National Zoning Atlas (check their license)
Code: MIT (or your preferred license)
