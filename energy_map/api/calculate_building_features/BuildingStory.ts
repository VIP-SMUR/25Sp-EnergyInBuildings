//BuildingStory.ts

// TODO: set number of floors based on a probability (i.e. not all hospitals will be 1 floor)

// based on the buildingType, set number of floors if not available in the dataset. for more info refer to page 53 https://www.nrel.gov/docs/fy23osti/83819.pdf
const BOC_NUM_FLOORS: Record<string, number> = {
    'Residential': 1,
    'Commercial': 2,
    'Assembly': 1,
    'Education': 1,
    'Health and Medical': 4,
    'Industrial': 1,
    'Government': 5,
    'Utility and Misc': 1,
    'Unclassified': 5,
};

export function getDefaultStories(properties: any): number {
    // 1. num_floors (preferred from Overture/Microsoft schema)
    if (properties.num_floors) {
        const floors = parseInt(properties.num_floors, 10);
        if (!isNaN(floors)) return floors;
    }

    // 2. building:levels (OSM convention)
    if (properties["building:levels"]) {
        const levels = parseInt(properties["building:levels"], 10);
        if (!isNaN(levels)) return levels;
    }

    // 3. Fallback based on BOC
    const boc = properties.BOC;
    if (boc && BOC_NUM_FLOORS[boc]) {
        return BOC_NUM_FLOORS[boc];
    }

    // 4. Final fallback if BOC is missing or unrecognized
    return 3;
}
