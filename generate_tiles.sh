#!/bin/bash
# Generate vector tiles for Colorado Zoning Atlas
# Run this script from WSL Ubuntu

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Colorado Zoning Atlas - Vector Tile Generation ===${NC}\n"

# Check if tippecanoe is installed
if ! command -v tippecanoe &> /dev/null; then
    echo -e "${RED}Error: tippecanoe is not installed${NC}"
    echo "Install it with: sudo apt-get install -y tippecanoe"
    exit 1
fi

# Check if pmtiles is installed
if ! command -v pmtiles &> /dev/null; then
    echo -e "${RED}Error: pmtiles is not installed${NC}"
    echo "Install it with:"
    echo "  curl -L https://github.com/protomaps/go-pmtiles/releases/latest/download/go-pmtiles_Linux_x86_64.tar.gz | tar xz"
    echo "  sudo mv pmtiles /usr/local/bin/"
    exit 1
fi

# Check if input file exists
INPUT_FILE="data/colorado_zoning_trimmed.geojson"
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}Error: Input file not found: $INPUT_FILE${NC}"
    echo "Run prepare_tiles.py first to generate the trimmed GeoJSON"
    exit 1
fi

echo -e "${GREEN}✓${NC} tippecanoe found: $(tippecanoe --version 2>&1 | head -n1)"
echo -e "${GREEN}✓${NC} pmtiles found: $(pmtiles --version 2>&1 | head -n1)"
echo -e "${GREEN}✓${NC} Input file found: $INPUT_FILE"

# Get input file size
INPUT_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
echo -e "${BLUE}Input file size: $INPUT_SIZE${NC}\n"

# Step 1: Generate MBTiles
echo -e "${BLUE}Step 1: Generating MBTiles with tippecanoe...${NC}"
MBTILES_FILE="data/colorado_zoning.mbtiles"

tippecanoe \
  -o "$MBTILES_FILE" \
  -Z8 -z14 \
  --layer=zoning \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --force \
  "$INPUT_FILE"

MBTILES_SIZE=$(du -h "$MBTILES_FILE" | cut -f1)
echo -e "${GREEN}✓ MBTiles generated: $MBTILES_FILE ($MBTILES_SIZE)${NC}\n"

# Step 2: Convert to PMTiles
echo -e "${BLUE}Step 2: Converting MBTiles to PMTiles...${NC}"
PMTILES_FILE="data/colorado_zoning.pmtiles"

pmtiles convert "$MBTILES_FILE" "$PMTILES_FILE"

PMTILES_SIZE=$(du -h "$PMTILES_FILE" | cut -f1)
echo -e "${GREEN}✓ PMTiles generated: $PMTILES_FILE ($PMTILES_SIZE)${NC}\n"

# Step 3: Cleanup intermediate file
echo -e "${BLUE}Step 3: Cleaning up intermediate files...${NC}"
rm "$MBTILES_FILE"
echo -e "${GREEN}✓ Removed $MBTILES_FILE${NC}\n"

# Summary
echo -e "${GREEN}=== Tile Generation Complete ===${NC}"
echo -e "Input:  $INPUT_FILE ($INPUT_SIZE)"
echo -e "Output: $PMTILES_FILE ($PMTILES_SIZE)"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Test locally: python -m http.server 8000 (from web/ directory)"
echo "2. Push to GitHub and enable GitHub Pages"
echo "3. Verify deployment at https://USERNAME.github.io/colorado-zoning-map/"
