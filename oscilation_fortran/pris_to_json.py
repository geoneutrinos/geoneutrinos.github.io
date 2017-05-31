import json
import csv

from math import sin, cos, radians


with open("IAEA PRIS Download2.csv", 'r') as f:
    reader = csv.DictReader(f)
    data = [row for row in reader]

#   dict_keys(['Status', 'Location', 'lng (-180 to 180)', 'Country Code', 'IAEA
#    url', 'alt (m)', 'lat (-90 to 90)', 'Load Factor (%)', 'Sitename', 'Gross
#    (MWe)', 'Country', 'Thermal (MWt)'])

earth_radius = 6371 #km
def lon_lat_alt_to_spherical(lon, lat, r):

    φ = radians(float(lat))
    λ = radians(float(lon))

    x = r * cos(φ) * cos(λ)
    y = r * cos(φ) * sin(λ)
    z = r * sin(φ)

    return (x, y, z)

def capacity_and_load_to_power(capacity, load):
    capacity = float(capacity)
    load = float(load)
    return capacity * (load/100)

rows = []
for d in data:
    if "Operational" not in d["Status"]:
        continue
    row = []
    lon = d['lng (-180 to 180)']
    lat = d['lat (-90 to 90)']
    #capacity = d['Thermal (MWt)']
    capacity = d['Capacity (MWt)']
    load_mean = d['Mean LF (%)']
    load_2013 = d['2013 LF (%)']
    row.extend(list(lon_lat_alt_to_spherical(lon, lat, earth_radius)))
    row.append(float(capacity_and_load_to_power(capacity, load_mean)))
    row.append(float(capacity_and_load_to_power(capacity, load_2013)))
    rows.append(row)

print(json.dumps(rows, indent=1))
