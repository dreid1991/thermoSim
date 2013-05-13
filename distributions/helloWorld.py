import numpy
import pylab
import math
from sympy import Symbol
from sympy.solvers import solve
from scipy import integrate

R = 8.314
m = .029 #kg/mol
enthalpyRxn = -10000.
eaF = 4000.
sysTemp = 298.15
eaR = eaF - enthalpyRxn
# boltz = lambda v: math.pow(m / (2 * math.pi * R * T), 1.5) * 4 * math.pi * v * v * math.exp(-m * v * v / (2 * R * T))

def fracAboveE(e, T):
	boltzByV = lambda v: v * math.pow(m / (2 * math.pi * R * T), 1.5) * 4 * math.pi * v * v * math.exp(-m * v * v / (2 * R * T))
	velocity = math.sqrt(2 * e / m) #e in j/mol I think
	print ('with e ' + str(e) + ' v is ' + str(velocity))
	return integrate.quad(boltzByV, velocity, 100000)[0]

	

print fracAboveE(10000, 298.15)

def eqConst(hRxn, temp):
	k298 = math.exp(-hRxn / (R * 298.15))
	return k298 * math.exp(-(hRxn / R) * (1 / temp - 1/298.15))		

def eqFracProds(hRxn, temp):
	#for second order, yo
	kT = eqConst(hRxn, temp)
	return 1. - 1. / (1. + math.sqrt(kT)) #ratios.  werk it out
	
def eqRatioProds(hRxn, temp):
	return math.sqrt(eqConst(hRxn, temp))
	
fracProds = eqFracProds(enthalpyRxn, sysTemp)
ratioProds = eqRatioProds(enthalpyRxn, sysTemp)

print ('frac prods ' + str(fracProds))
#WAAAIIIT - THE FAST ONES COLLIDE MORE FREQUENTLY.  YON'S ANALYSIS IS FLAWED
print (fracProds * fracAboveE(eaR, sysTemp))
print ((1 - fracProds) * fracAboveE(eaF, sysTemp))




#print integrate.quad(boltz, 0, 1000)
deltaSRxn = numpy.linspace(-100, 100, 50)
print deltaSRxn
eqProds = []
for s in deltaSRxn:
	frac = Symbol('frac')
	anss = solve(math.exp(-(enthalpyRxn - s * sysTemp) / (R * sysTemp)) - frac * frac / ((1 - frac) * (1 - frac)), frac)
	for ans in anss:
		if 0 <= ans <= 1:
			eqProds.append(ans)
			break

print eqProds
pylab.plot(deltaSRxn, eqProds)
pylab.show()

# N = 30
# x = 0.9 * rand(N)
# y = 0.9 * rand(N)
# scatter(x, y)
# show()