# Deploy to GitHub Pages

## Once you've tested locally and everything works:

### 1. Create GitHub Repository

Go to: https://github.com/new

- Repository name: `denver-metro-zoning-map` (or your choice)
- Make it **Public**
- **Do NOT** check "Add a README file"
- Click "Create repository"

### 2. Initialize Git and Push

Copy your GitHub username and repository name, then run these commands:

```bash
cd "C:\Users\luket\OneDrive\Desktop\Claude Projects\Map Endpoint\web"

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Denver Metro Zoning Atlas - Proof of Concept

Interactive web map with ~60,000 parcels across 26 Denver metro jurisdictions.
- MapLibre GL JS + PMTiles vector tiles (14 MB)
- Color-coded by zoning type with detailed popups
- Proof of concept - partial coverage only
- Data from National Zoning Atlas (zoningatlas.org)"

# Add your GitHub repository (REPLACE USERNAME AND REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

After pushing:

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

Wait 1-2 minutes, then your site will be live at:

**https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/**

### 4. Verify Deployment

- Open the GitHub Pages URL
- Check that everything works:
  - Map loads
  - POC banner visible
  - Tiles render
  - Click interactions work
  - Legend displays

---

## Files Being Deployed

Total size: ~185 MB
- `data/colorado_zoning.pmtiles` - 14 MB ✅
- `data/colorado_zoning_trimmed.geojson` - 171 MB (not used by web map, but included for reference)
- HTML/CSS/JS - <1 MB
- Documentation - ~1 MB

**Note:** The trimmed GeoJSON is included for reference but not loaded by the web app. Only the 14 MB PMTiles file is used.

---

## If You Get Errors

**"Repository not found":**
- Make sure you replaced YOUR-USERNAME and YOUR-REPO-NAME
- Check the repository is public
- Verify the remote URL: `git remote -v`

**"File too large" (over 100 MB):**
- Our PMTiles is only 14 MB, so this should not happen
- If it does, we can exclude the trimmed GeoJSON from the repo

**GitHub Pages not building:**
- Check the Actions tab in GitHub for build errors
- Wait 2-3 minutes for initial build
- Try hard refresh: Ctrl+Shift+R
