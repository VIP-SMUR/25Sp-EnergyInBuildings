// gets heights from overture, but if missing then this calculates heights based on the comstock NREL documentation: https://www.nrel.gov/docs/fy23osti/83819.pdf

// NOTE: heights here are in meters, but comstock documentation is in feet. data is also in meters

export const getDefaultHeight = (properties: any): number => {
    // 1. If height is already provided
    if (properties.height) {
        return properties.height;
    }

    // 2. If building:levels is provided, multiply by a standard floor height (3m)
    if (properties["building:levels"]) {
        return parseInt(properties["building:levels"], 10) * 3;
    }

    // 3. If BOC is known, use a rough default height per BOC
    const bocHeights: Record<string, number> = {
        'Residential': 2.438, // based on googled average home height
        'Commercial': 4.4, // from NREL comstock average
        'Assembly': 3.048, // from FullServiceRestaurange in NREL
        'Education': 3.9624, //from PrimarySchool in NREL
        'Health and Medical': 4.2672, //from Hospital in NREL
        'Industrial': 8.5344, //from WareHouse in NREL
        'Government': 3.6576, //from average of 3 office types in NREL
        'Utility and Misc': 3.6576, // same as above
        'Unclassified': 3.6576, // same as above

    };

    if (properties.BOC && bocHeights[properties.BOC]) {
        return bocHeights[properties.BOC];
    }

    // 4. Final fallback if nothing else is available
    return 3; // Default minimum height (in meters)
};
