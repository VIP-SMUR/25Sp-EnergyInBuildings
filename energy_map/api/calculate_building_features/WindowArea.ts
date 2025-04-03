

// window area depends on the type of building
// for example:
// 1 = 100% window area (windows cover the full wall area), 2 = 50% window area, 3 = 33% window area, 4 = 25% window area, 5 = 20%, 6 = 16%, 7 = 14%, 8 = 12%
// for more information about the ratios see: https://www.nrel.gov/docs/fy23osti/83819.pdf (page 54)

const WINDOW_AREA_MAP: Record<string, number> = {
    'Residential': 5,
    'Commercial': 3,
    'Assembly': 3,
    'Education': 1,
    'Health and Medical': 5,
    'Industrial': 3,
    'Government': 3,
    'Utility and Misc': 3,
    'Unclassified': 0,
};

export function calculateWindowArea(properties: any, wallArea: number): number {
    const boc = properties.BOC;
    const ratio = WINDOW_AREA_MAP[boc] ?? 3; // fallback to 33% if unknown

    if (ratio === 0 || wallArea <= 0) return 0;

    return wallArea / ratio;
}
