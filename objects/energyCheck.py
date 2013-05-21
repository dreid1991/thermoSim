# from sympy import Symbol, nsolve
# import sympy
import math


mA = 2.5
mB = 2.5
mD = 5.
vAo = -5.
vBo = 1.
vDo = 3.

yA = 0.
yB = 10. #yB > yA
yD = 10.

yCenter = .5 * (yA + yB)
IWall = mA * abs(yCenter - yA)**2 + mB * abs(yCenter - yB)**2


rWallP = abs(yD - yCenter)

voWallTrans = .5 * (vAo + vBo)
vAoRel = vAo - voWallTrans
vBoRel = vBo - voWallTrans

vWallToDot = vAo * yD / (yB - yA) + vBo * (1 - yD / (yB - yA))

vAB = vDo - vWallToDot
j = - 2 * vAB / ((1 / mD + 1 / (mA + mB)) + rWallP**2 / IWall)
#((rWallP**2) / IWall)
#2 because e = 1
vDf = vDo + j / mD

vfWallTrans = voWallTrans - j / (mA + mB)

omegaAo = vAoRel / abs(yA - yCenter)
omegaAf = omegaAo - abs(yD - yCenter) * j / IWall
vAfRel = abs(yA - yCenter) * omegaAf

vBfRel = -vAfRel


vAf = vfWallTrans + vAfRel
vBf = vfWallTrans + vBfRel

# voDot = 1
# voA = 0
# voB = 0
# mDot = 5
# mA = 10
# mB = 10
# fracToB = .8

def vf(vo1, vo2, m1, m2):
	return (vo1 * (m1 - m2) + 2 * m2 * vo2) / (m1 + m2)
	
def ke(m, v):
	return .5 * m * v * v
	
print 'KeO ' + str(ke(mD, vDo) + ke(mA, vAo) + ke(mB, vBo))
print 'keF ' + str(ke(mD, vDf) + ke(mA, vAf) + ke(mB, vBf))
# mDotA = mDot * (1 - fracToB)
# mDotB = mDot * fracToB
# vFA = vf(voA, voDot, mA, mDotA)
# vFB = vf(voB, voDot, mB, mDotB)
# vFDot = ((mDot * voDot + mA * voA + mB * voB) - (mA * vFA + mB * vFB)) / mDot;


# print 'vFDot ' + str(vFDot)
# print 'vFA ' + str(vFA)
# print 'vFB ' + str(vFB)
# print 'keF ' + str(ke(mDot, vFDot) + ke(mA, vFA) + ke(mB, vFB))