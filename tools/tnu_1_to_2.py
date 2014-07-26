import math
import csv
from decimal import Decimal

def area(north_lat, south_lat, width, earth_radius=6371):
    lon_width = math.radians(width) # degrees
    dLat = math.sin(math.radians(north_lat)) - math.sin(math.radians(south_lat))
    area = (earth_radius ** 2 * lon_width * dLat)
    return area

c_order = []
with open("lon_lats.csv", "r") as f:
    r = csv.reader(f)
    for l in r:
        lon, lat = l
        c_order.append((lon, lat))


c_dict = {}
for k in c_order:
    lon, lat = k
    a = area(float(lat), float(lat) -2 , 2)
    c_dict[k] = a

i_dict = {}
with open("tnu_1deg_crust_map.csv", "r") as f:
    r = csv.reader(f)
    for l in r:
        lon, lat, data = l
        a = area(float(lat) + 0.5, float(lat) - 0.5, 1)
        i_dict[(lon, lat)] = {"area":a, "data":float(data)}


out_dict = {}
for k in c_dict:
    a = c_dict[k]
    # need to figure out the 4 keys we need...
    lon = Decimal(k[0])
    lat = Decimal(k[1])
    k1 = (str(lon + Decimal(0.5)), str(lat - Decimal(0.5)))
    k2 = (str(lon + Decimal(0.5)), str(lat - Decimal(1.5)))
    k3 = (str(lon + Decimal(1.5)), str(lat - Decimal(0.5)))
    k4 = (str(lon + Decimal(1.5)), str(lat - Decimal(1.5)))

    pt1 = i_dict[k1]["data"] * (i_dict[k1]["area"]/a)
    pt2 = i_dict[k2]["data"] * (i_dict[k2]["area"]/a)
    pt3 = i_dict[k3]["data"] * (i_dict[k3]["area"]/a)
    pt4 = i_dict[k4]["data"] * (i_dict[k4]["area"]/a)

    out_dict[k] = pt1 + pt2 + pt3 + pt4

for k in c_order:
    print out_dict[k]
