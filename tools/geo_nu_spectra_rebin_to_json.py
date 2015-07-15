import math
import json

out = {}
th232 = []
u238 = []
with open("../assets/th232_evtpdf.dat", 'r') as f:
    for l in f:
        th232.append(float(l))
with open("../assets/u238_evtpdf.dat", 'r') as f:
    for l in f:
        u238.append(float(l))

th232_out = []
for i in range(0, len(th232), 100):
    th232_out.append(sum(th232[i:i+100]))
u238_out = []
for i in range(0, len(u238), 100):
    u238_out.append(sum(u238[i:i+100]))
th232_out += [0] * 600
u238_out += [0] * 600

print(json.dumps({"th232":th232_out, "u238":u238_out}))
