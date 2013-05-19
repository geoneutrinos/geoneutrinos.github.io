import math
import numpy as np

class MantleModel:
    '''Write me'''


    # data column locations
    radius = 0
    depth = 1
    density = 2
    alpha = 3
    beta = 5
    
    
    def _fd(self, prem):
        names = ["Ocean",
                "Upper Crust",
                "Middle Crust",
                "Lower Crust",
                "LID",
                "Low Velocity Zone",
                "Discontinuity 1",
                "Discontinuity 2",
                "Transition Zone",
                "Lower Mantle",
                "D''",
                "Outer Core",
                "Inner Core",]
        discontinuities = []
        index = []
        last = None
        for i, l in enumerate(prem[:,0]):
            if last == l:
                discontinuities.append(l)
                index.append(i)
            last = l

        output = []
        for i, discontinuity, name in zip(index, discontinuities, names):
            output.append((i, discontinuity, name))

        return output


    def __init__(self):
        self._prem = np.genfromtxt("PREM_1s.csv", delimiter=",",)
        self._discontinuties = self._fd(self._prem)
        self.earth_radius = 6.371 # megameters



    def integrate(self, r1, r2):
        def _integrate_part(top, bot):
            a = (math.log(top)/2. - 0.25) * top ** 2
            b = (math.log(bot)/2. - 0.25) * bot ** 2
            c = top * math.log(top) - top
            d = bot * math.log(bot) - bot
            phi = a - b - c + d
            return phi

        top = 1. + r2/self.earth_radius
        bot = 1. + r1/self.earth_radius
        phi = _integrate_part(top, bot)
        top = 1. - r2/self.earth_radius
        bot = 1. - r1/self.earth_radius
        phi2 = _integrate_part(top, bot)
        phi = phi - phi2
        phi = phi * self.earth_radius/2.
        return phi


    def output_chunks(self):
        def find_name(index):
            dis = self.discontinuities
            # prep the tester thing
            output = None
            for id, discontinuity, name in dis:
                if index <= id:
                    output = name
                if output:
                    return output
            if output == None:
                return dis[-1][2]

        last = None
        for i, layer in enumerate(self.prem):
            if last == None:
                last = layer
                continue
            print find_name(i), layer
            


    @property
    def prem(self):
        return self._prem

    @property
    def discontinuities(self):
        return self._discontinuties

if __name__ == "__main__":
    a = MantleModel()
    a.output_chunks()
