import json

import pyexcel

columns = [
        "country",
        "name",
        "lat",
        "lon",
        "type",
        "mox",
        "power",
        *[str(d) for d in range(1,13)]
        ]

years = [
        "2003",
        "2004",
        "2005",
        "2006",
        "2007",
        "2008",
        "2009",
        "2010",
        "2011",
        "2012",
        "2013",
        "2014",
        "2015",
    ]

reactor_data = {}
all_names = set()

reactors = {}
times = []
loads = {}

for year in years:
    file = "DB" + year + ".xls"

    data = pyexcel.get_array(file_name=file)

    if file == "DB2011.xls":
        # the 2011 file has a one line header
        data.pop(0)

    year_data = {d[1].strip().upper():{col:val for col, val in zip(columns, d)} for d in data}

    reactor_data[year] = year_data

    names = {d[1].strip().upper() for d in data}
    all_names.update(names)

for name in all_names:
    empty = [0] * 12
    loads[name] = []
    for year in years:
        try:
            loads[name].extend([reactor_data[year][name][month] for month in [str(d) for d in range(1,13)]])
            reactors[name] = {
                'lat' : reactor_data[year][name]['lat'],
                'lon' : reactor_data[year][name]['lon'],
                'power' : reactor_data[year][name]['power'],
                }
        except KeyError:
            loads[name].extend(empty)

for year in years:
    times.extend(["{0}-{1:0>2}".format(year,m) for m in range(1,13)])

print(json.dumps({
    "reactors": reactors,
    "times": times,
    "loads": loads,
    }))
