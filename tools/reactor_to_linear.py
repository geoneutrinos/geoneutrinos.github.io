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

#load the reactor data
flux = []
signal11 = []
signal33 = []
with open("AGUreactorflux.txt", "r") as f:
    r = csv.reader(f, delimiter="\t")
    for l in r:
        flux.append([float(i.strip()) for i in l[:-1]])

with open("AGUreactorflux0_11MeV_tnu.txt", "r") as f:
    r = csv.reader(f, delimiter="\t")
    for l in r:
        signal11.append([float(i.strip()) for i in l[:-1]])

with open("AGUreactorflux0_3p3MeV_tnu.txt", "r") as f:
    r = csv.reader(f, delimiter="\t")
    for l in r:
        signal33.append([float(i.strip()) for i in l[:-1]])

def get_data(data, key):
    #figure out based on a 1.0 deg (lon, lat) key what the index is
    lon = key[0]
    lat = key[1]

    lat_i = Decimal(179.5) - (Decimal(90) + Decimal(lat))
    lon_i = Decimal(359.5) - (Decimal(180) - Decimal(lon))


    return data[int(lat_i)][int(lon_i)]

i_dict = {}
lat = 89.5
lon = 179.5

keys = []

while (lat >= -90):
    while (lon >= -180):
        key = (lon, lat)
        keys.append(key)
        lon -= 1
    lon = 179.5
    lat -= 1

for key in keys:
    a = area(key[1] + 0.5, key[1] - 0.5, 1)
    data = [get_data(flux, key), get_data(signal33, key), get_data(signal11, key)]
    i_dict[(str(key[0]), str(key[1]))] = {"area": a, "data": data}

out_dict = {}
for k in c_dict:
    d = []
    a = c_dict[k]
    # need to figure out the 4 keys we need...
    lon = Decimal(k[0])
    lat = Decimal(k[1])
    k1 = (str(lon + Decimal(0.5)), str(lat - Decimal(0.5)))
    k2 = (str(lon + Decimal(0.5)), str(lat - Decimal(1.5)))
    k3 = (str(lon + Decimal(1.5)), str(lat - Decimal(0.5)))
    k4 = (str(lon + Decimal(1.5)), str(lat - Decimal(1.5)))

    for i, _ in enumerate(i_dict[k1]["data"]):
        pt1 = i_dict[k1]["data"][i] * (i_dict[k1]["area"]/a)
        pt2 = i_dict[k2]["data"][i] * (i_dict[k2]["area"]/a)
        pt3 = i_dict[k3]["data"][i] * (i_dict[k3]["area"]/a)
        pt4 = i_dict[k4]["data"][i] * (i_dict[k4]["area"]/a)
        d.append(pt1 + pt2 + pt3 + pt4)

    out_dict[k] = d

for k in c_order:
    print ",".join(["{:.3f}".format(e) for e in out_dict[k]])
