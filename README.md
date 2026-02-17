# Colorado Front Range Zoning Atlas - Web Map

## 🗺️ EXTENDED FRONT RANGE COVERAGE

**Current Dataset:** Complete Front Range corridor (Boulder to Castle Rock)
- **273,899 parcels** across the extended Denver metro area
- **Coverage:** Boulder (north) to Castle Rock (south), mountain foothills to eastern plains
- **Bounding box:** -105.50 to -104.49 longitude, 39.29 to 40.31 latitude
- **1,833 square miles** of zoning data

Interactive web map using vector tiles and MapLibre GL JS.

## Live Map

🌐 **https://teater277.github.io/CO-zoning-map/**

## Coverage Details

**Geographic extent:**
- **North:** Boulder area (40.31° N)
- **South:** Castle Rock area (39.29° N)  
- **West:** Mountain communities (105.50° W)
- **East:** Eastern suburbs and plains (104.49° W)

**Data quality:**
- 273,899 zoning parcels
- 723 unique zone codes
- Zoom levels 8-15 (state view to detailed parcel view)
- 71 MB PMTiles file (efficient web delivery)

## Features

- **Color-coded zoning types:**
  - 🟡 Residential (R) - 87,687 parcels (50.2%)
  - 🔴 Mixed-Use/Commercial (M) - 53,818 parcels (30.8%)
  - 🟢 Special Purpose (X) - 16,370 parcels (9.4%)
  - 🟣 Overlay District (O) - 16,856 parcels (9.6%)
  - ⚪ Unclassified (U) - 120 parcels (0.1%)

- **Interactive popups:** Click any parcel for detailed zoning regulations
- **Smooth performance:** Vector tiles load progressively as you zoom/pan
- **Detailed regulations:** View housing type allowances, parking requirements, lot sizes, height limits

## Technologies Used

- **MapLibre GL JS 4.7.1** - Open-source map rendering engine
- **PMTiles 3.2.0** - Single-file vector tile archive format
- **Tippecanoe** - Vector tile generator from Mapbox
- **GitHub Pages** - Free static hosting

## Data Attribution

Data sourced from the [National Zoning Atlas](https://www.zoningatlas.org) - a comprehensive database of zoning regulations across the United States.

## Local Development

To run locally with proper Range request support for PMTiles:

```bash
python server.py
# Visit http://localhost:8080
```

**Note:** Standard Python http.server does NOT support Range requests. Use the included `server.py` which adds Range request support.

## Dataset Expansion History

- **Initial:** ~60,000 parcels (central Denver metro)
- **First expansion:** 123,316 parcels (+105%, February 2026)
- **Current:** 273,899 parcels (+122% from previous, February 2026)

## Future Enhancements

Possible improvements:
- Expand to complete Colorado coverage
- Add search by address/jurisdiction
- Filter by zoning type or regulations
- Mobile-responsive improvements
- Statistics dashboard
- Export functionality

## License

Data: National Zoning Atlas  
Code: MIT
