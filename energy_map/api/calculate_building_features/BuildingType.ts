/**
 * For example:
 * BOC = "Health and Medical" (from merged dataset)
 * → building type = "Hospital"
 * → building index = 10
 * → sent to API: Building_Type: 10

 */

// building types that are passed into the model
const buildingTypeToIndex: Record<string, number> = {
  "Small Hotel": 0,
  "Retail": 1,
  "Office": 2,
  "WareHouse": 3,
  "StripMall": 4,
  "Outpatient": 5,
  "FullServiceRestaurant": 6,
  "QuickServiceRestaurant": 7,
  "LargeHotel": 8,
  "PrimarySchool": 9,
  "Hospital": 10,
  "SecondarySchool": 11,
};

// BOC -> building type
const bocToModelType: Record<string, string> = {
  "Residential": "Small Hotel", // small hotel = 0 for the model
  "Commercial": "Retail", // retail = 1 for the model
  "Assembly": "FullServiceRestaurant", // FullServiceRestaurant = 2 for the model
  "Education": "PrimarySchool",
  "Health and Medical": "Hospital",
  "Industrial": "WareHouse",
  "Government": "Office",
  "Utility and Misc": "WareHouse",
  "Unclassified": "Office",
};

/**
 * Map a BOC string to a model type index number.
 */
export const mapBOCToModelIndex = (boc: string | undefined): number => {
  if (!boc) return buildingTypeToIndex["Office"]; // fallback
  const modelType = bocToModelType[boc.trim()] || "Office";
  return buildingTypeToIndex[modelType];
};

