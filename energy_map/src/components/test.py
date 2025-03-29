from shapely.geometry import Polygon
from pyproj import Geod

# Define your coordinates in (longitude, latitude) format
coords = [
    (-76.5003756, 42.4359047),
    (-76.5003711, 42.4358173),
    (-76.5001438, 42.4358237),
    (-76.5001483, 42.4359112),
    (-76.5003756, 42.4359047)  # Close the polygon
]


# Create a polygon
polygon = Polygon(coords)

# Use pyproj.Geod to calculate the area
geod = Geod(ellps = "WGS84")
area, _ = geod.geometry_area_perimeter(polygon)

# Area is returned in square meters(but negative if ring is clockwise)
area_m2 = abs(area)

print(f"Roof Area: {area_m2:.2f} m²")
