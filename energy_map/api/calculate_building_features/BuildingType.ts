/**
 * For example:
 * BOC = "Health and Medical" (from merged dataset)
 * → building type = "Hospital"
 * → building index = 10
 * → sent to API: Building_Type: 10

 */

export const buildingTypeToIndex: Record<string, number> = {
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

export const indexToBuildingType: Record<number, string> = Object.entries(buildingTypeToIndex).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<number, string>);

export const mapBOCToModelIndex = (): number => {
  const types = Object.values(buildingTypeToIndex);
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
};


