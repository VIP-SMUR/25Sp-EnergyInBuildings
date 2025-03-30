
// from the model, there are 4 energy code categories.
// 0 = ComStock 90.1-2007
// 1 = ComStock DOE Ref 1980-2004
// 2 = ComStock 90.1-2004
// 3 = ComStock DOE Ref Pre-1980


const ENERGY_CATEGORY_MAP: Record<string, number> = {
    'Residential': 3,
    'Commercial': 1,
    'Assembly': 2,
    'Education': 1,
    'Health and Medical': 2,
    'Industrial': 3,
    'Government': 2,
    'Utility and Misc': 1,
    'Unclassified': 0,
};

export function getEnergyCategory(properties: any): number {
    const boc = properties.BOC;
    return ENERGY_CATEGORY_MAP[boc] ?? 1; // Default to 1 if unknown
}
