from csv import DictReader
import math
import json

out = {}
with open("../assets/Huang_crust_flux.csv", 'r') as f:
    reader = DictReader(f)
    for r in reader:
        r = {k:float(v) for k,v in r.iteritems()}
        r["Longitude"] = int(math.ceil(r["Longitude"]))
        r["Latitude"] = int(math.ceil(r["Latitude"]))
        if r["Longitude"] not in out:
            out[r["Longitude"]] = {}

        out[r["Longitude"]][r["Latitude"]] = {"U": r["U"], "Th": r["Th"],
                "K":r["K"]}
print json.dumps(out, separators=(',',':'))
