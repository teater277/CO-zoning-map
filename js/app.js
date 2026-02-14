// Initialize PMTiles protocol
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

// Color mapping for zoning types
const ZONING_COLORS = {
    'R': '#fbbf24',  // Residential - yellow/gold
    'M': '#f87171',  // Mixed/Commercial - red/pink
    'X': '#4ade80',  // Special Purpose - green
    'O': '#a78bfa',  // Overlay - purple
    'U': '#9ca3af'   // Unclassified - gray
};

// Initialize map centered on Denver metro area
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
            'osm': {
                type: 'raster',
                tiles: [
                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            'zoning': {
                type: 'vector',
                url: 'pmtiles://./data/colorado_zoning.pmtiles',
                attribution: '<a href="https://www.zoningatlas.org">National Zoning Atlas</a>'
            }
        },
        layers: [
            {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 19
            }
        ]
    },
    center: [-104.95, 39.74],  // Denver
    zoom: 10,
    maxZoom: 18,
    minZoom: 8
});

// Add navigation controls
map.addControl(new maplibregl.NavigationControl(), 'top-left');

// Add scale control
map.addControl(new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: 'imperial'
}), 'bottom-left');

// Wait for map to load, then add zoning layers
map.on('load', () => {
    // Add zoning fill layer with color-coding by type
    map.addLayer({
        id: 'zoning-fill',
        type: 'fill',
        source: 'zoning',
        'source-layer': 'zoning',
        paint: {
            'fill-color': [
                'match',
                ['get', 'type'],
                'R', ZONING_COLORS.R,
                'M', ZONING_COLORS.M,
                'X', ZONING_COLORS.X,
                'O', ZONING_COLORS.O,
                'U', ZONING_COLORS.U,
                '#cccccc'  // Default fallback
            ],
            'fill-opacity': 0.5,  // More transparent to see streets below
            'fill-outline-color': 'rgba(0, 0, 0, 0)'
        }
    });

    // Add zoning outline layer
    map.addLayer({
        id: 'zoning-outline',
        type: 'line',
        source: 'zoning',
        'source-layer': 'zoning',
        paint: {
            'line-color': '#333333',
            'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.2,
                14, 0.8
            ],
            'line-opacity': 0.3
        }
    });

    // Add hover highlight layer
    map.addLayer({
        id: 'zoning-highlight',
        type: 'line',
        source: 'zoning',
        'source-layer': 'zoning',
        paint: {
            'line-color': '#000000',
            'line-width': 2
        },
        filter: ['==', ['id'], '']  // Initially empty
    });

    console.log('Map layers loaded successfully');
});

// Track hovered feature
let hoveredFeatureId = null;

// Hover effect
map.on('mousemove', 'zoning-fill', (e) => {
    if (e.features.length > 0) {
        // Change cursor
        map.getCanvas().style.cursor = 'pointer';

        // Update highlight
        const feature = e.features[0];
        if (hoveredFeatureId !== feature.id) {
            hoveredFeatureId = feature.id;
            map.setFilter('zoning-highlight', ['==', ['id'], feature.id]);
        }
    }
});

map.on('mouseleave', 'zoning-fill', () => {
    map.getCanvas().style.cursor = '';
    hoveredFeatureId = null;
    map.setFilter('zoning-highlight', ['==', ['id'], '']);
});

// Click handler - show popup with zoning details
map.on('click', 'zoning-fill', (e) => {
    if (e.features.length === 0) return;

    const props = e.features[0].properties;

    // Build popup HTML
    const html = buildPopupHTML(props);

    // Create and show popup
    new maplibregl.Popup({
        maxWidth: '400px'
    })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
});

/**
 * Build HTML content for zoning detail popup
 */
function buildPopupHTML(props) {
    let html = '<div class="popup-content">';

    // Header: Zone name
    html += '<div class="popup-header">';
    html += `<h3>${props.abbrvname || props.name || 'Unknown Zone'}</h3>`;
    if (props.name && props.name !== props.abbrvname) {
        html += `<div class="jurisdiction" style="font-size: 13px; color: #6b7280; margin-top: 4px;">${props.name}</div>`;
    }
    html += '</div>';

    // Zoning type badge
    if (props.type) {
        html += '<div class="popup-section">';
        const typeLabels = {
            'R': 'Residential',
            'M': 'Mixed-Use / Commercial',
            'X': 'Special Purpose',
            'O': 'Overlay District',
            'U': 'Unclassified'
        };
        const typeColors = {
            'R': '#fbbf24',
            'M': '#f87171',
            'X': '#4ade80',
            'O': '#a78bfa',
            'U': '#9ca3af'
        };
        const typeLabel = typeLabels[props.type] || props.type;
        html += `<span class="badge" style="background-color: ${typeColors[props.type]}; color: #1f2937; font-weight: 600;">${typeLabel}</span>`;
        html += '</div>';
    }

    // Housing type details (single-family through 4+ units)
    const housingTypes = [
        { key: 'family1', label: 'Single-Family' },
        { key: 'family2', label: 'Duplex (2 units)' },
        { key: 'family3', label: 'Triplex (3 units)' },
        { key: 'family4', label: '4+ Units' }
    ];

    let hasDetails = false;
    let detailsHTML = '';

    housingTypes.forEach(type => {
        const treatment = props[`${type.key}_treatment`];
        const minlot = props[`${type.key}_minlotacres`];
        const minlotMin = props[`${type.key}_minlotacres_min`];
        const minlotMax = props[`${type.key}_minlotacres_max`];
        const parking = props[`${type.key}_parking`];
        const height = props[`${type.key}_heightcap`];
        const elderlyonly = props[`${type.key}_elderlyonly`];
        const sewage = props[`${type.key}_sewage`];
        const transit = props[`${type.key}_transit`];

        // Only show if there's data for this housing type
        if (treatment || minlot || minlotMin || parking || height) {
            hasDetails = true;
            detailsHTML += `<div class="popup-housing-type">`;
            detailsHTML += `<h5>${type.label}</h5>`;

            if (treatment) {
                const badgeClass = getBadgeClass(treatment);
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Treatment:</span>`;
                detailsHTML += `<span class="badge ${badgeClass}">${treatment}</span>`;
                detailsHTML += `</div>`;
            }

            if (elderlyonly && elderlyonly.toString().toLowerCase() === 'true') {
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Restriction:</span>`;
                detailsHTML += `<span class="badge badge-conditional">Elderly Only</span>`;
                detailsHTML += `</div>`;
            }

            if (minlotMin || minlotMax) {
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Min Lot Size:</span>`;
                detailsHTML += `<span class="popup-field-value">${formatLotRange(minlotMin, minlotMax)}</span>`;
                detailsHTML += `</div>`;
            } else if (minlot) {
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Min Lot Size:</span>`;
                detailsHTML += `<span class="popup-field-value">${formatLotSize(minlot)}</span>`;
                detailsHTML += `</div>`;
            }

            if (parking !== null && parking !== undefined) {
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Parking Required:</span>`;
                detailsHTML += `<span class="popup-field-value">${formatParking(parking)}</span>`;
                detailsHTML += `</div>`;
            }

            if (height) {
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Height Limit:</span>`;
                detailsHTML += `<span class="popup-field-value">${height}</span>`;
                detailsHTML += `</div>`;
            }

            if (sewage && sewage.toString().toLowerCase() === 'true') {
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Sewage Required:</span>`;
                detailsHTML += `<span class="popup-field-value">Yes</span>`;
                detailsHTML += `</div>`;
            }

            if (transit && transit.toString().toLowerCase() === 'true') {
                detailsHTML += `<div class="popup-field">`;
                detailsHTML += `<span class="popup-field-label">Near Transit Required:</span>`;
                detailsHTML += `<span class="popup-field-value">Yes</span>`;
                detailsHTML += `</div>`;
            }

            detailsHTML += `</div>`;
        }
    });

    if (hasDetails) {
        html += '<div class="popup-section">';
        html += '<h4>Regulations by Housing Type</h4>';
        html += detailsHTML;
        html += '</div>';
    } else {
        html += '<div class="popup-section">';
        html += '<p style="color: #6b7280; font-style: italic; margin: 4px 0;">Regulation details not available for this district.</p>';
        html += '</div>';
    }

    // Accessory units
    if (props.accessory_treatment || props.accessory_occupancy) {
        html += '<div class="popup-section">';
        html += '<h4>Accessory Units (ADUs)</h4>';
        if (props.accessory_treatment) {
            const badgeClass = getBadgeClass(props.accessory_treatment);
            html += `<div class="popup-field">`;
            html += `<span class="popup-field-label">Treatment:</span>`;
            html += `<span class="badge ${badgeClass}">${props.accessory_treatment}</span>`;
            html += `</div>`;
        }
        if (props.accessory_occupancy) {
            html += `<div class="popup-field">`;
            html += `<span class="popup-field-label">Occupancy:</span>`;
            html += `<span class="popup-field-value">${props.accessory_occupancy}</span>`;
            html += `</div>`;
        }
        html += '</div>';
    }

    html += '</div>';
    return html;
}

/**
 * Get badge CSS class based on treatment value
 */
function getBadgeClass(treatment) {
    if (!treatment) return '';

    const t = treatment.toLowerCase();
    if (t.includes('permit') || t.includes('allow')) {
        return 'badge-permitted';
    } else if (t.includes('condition')) {
        return 'badge-conditional';
    } else if (t.includes('prohibit') || t.includes('not permit')) {
        return 'badge-prohibited';
    }
    return '';
}

/**
 * Format lot size for display
 */
function formatLotSize(acres) {
    if (acres === null || acres === undefined) return 'N/A';

    const acresNum = parseFloat(acres);
    if (isNaN(acresNum)) return acres;

    if (acresNum < 0.1) {
        // Show in square feet for small lots
        const sqft = Math.round(acresNum * 43560);
        return `${sqft.toLocaleString()} sq ft`;
    } else {
        return `${acresNum.toFixed(2)} acres`;
    }
}

/**
 * Format lot size range for display (min-max)
 */
function formatLotRange(minAcres, maxAcres) {
    const minStr = minAcres ? formatLotSize(minAcres) : null;
    const maxStr = maxAcres ? formatLotSize(maxAcres) : null;

    if (minStr && maxStr && minStr !== maxStr) {
        return `${minStr} - ${maxStr}`;
    }
    return minStr || maxStr || 'N/A';
}

/**
 * Format parking requirement for display
 * IMPORTANT: 'False' = NO parking required, 'True' = parking required
 */
function formatParking(parking) {
    if (parking === null || parking === undefined) return 'N/A';

    const p = parking.toString().toLowerCase();
    if (p === 'false' || p === '0') {
        return 'No (minimums eliminated)';
    } else if (p === 'true' || p === '1') {
        return 'Yes (minimums required)';
    }
    return parking;
}

// Log when map is ready
map.on('idle', () => {
    console.log('Map is ready and idle');
});

// Error handling
map.on('error', (e) => {
    console.error('Map error:', e);
});
