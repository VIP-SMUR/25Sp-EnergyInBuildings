
// from the model, there are 4 HVAC categories.
// 0 = ComStock 90.1-2007
// 1 = ComStock DOE Ref 1980-2004
// 2 = ComStock 90.1-2004
// 3 = ComStock DOE Ref Pre-1980

// from the model dataset, there are 4 HVAC categories
// 0 = Small Packaged Unit
// 1 = Multizone CAV/VAV
// 2 = Zone-by-Zone
// 3 = Resitendiat Style Cnetral Systems

const HVAC_CATEGORY_MAP: Record<string, number> = {
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

export function getHVACCategory(properties: any): number {
    const boc = properties.BOC;
    return HVAC_CATEGORY_MAP[boc] ?? 1; // Default to 1 if unknown
}
