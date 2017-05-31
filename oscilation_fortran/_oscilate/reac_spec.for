      program reac_spec
      dimension spectrum(1000),wiggles(1000)
c reactor spectral fit parameters- empirical from JGL
      data e1/0.8/
      data e2/1.43/
      data e3/3.2/
c base rate: pre-oscillation, E_nu>3.4 MeV with 100% detection efficiency
c in units of /yr/GW/10^32 free protons for reactor at earth center
      data baserate/.00808/
      print *,' calculating unoscillated spectrum'
      do k=1,1000
         spectrum(k)=0.000000
         if((k.gt.179).and.(k.lt.1000))then
            enu=k/100.
            spectrum(k)=((enu-e2)**2)*exp(-((enu+e1)/e3)**2)
c            print *,k,spectrum(k)
            if(k.gt.339) fluxnorm=fluxnorm+spectrum(k)
         end if
      end do
      scale=baserate/fluxnorm
      print *,' spectrum scaling',fluxnorm,scale
c normalize spectrum to 1 GW/yr/10^32p+ at earth center
      fluxnorm=0.000000
      open(33,file='barna_spec.dat')
      do k=1,1000
         spectrum(k)=spectrum(k)*scale
         fluxnorm=fluxnorm+spectrum(k)
c         print *,k,spectrum(k),fluxnorm
         write(33,222) spectrum(k)
      end do
      print *,' baserate events ',fluxnorm 
222   format(2x,f12.11)
      close(33)
c distance (km) between reactor and detector
      rdist=60.
c power (GW) of reactor
      rpwr=3.2
      call nuosc(rdist,rpwr,wiggles)
      open(34,file='barna_spec_wiggles.dat')
      do j=1,1000
         write(34,222) wiggles(j)*spectrum(j)
      end do
      close(34)
      return
      end

      subroutine nuosc(dist,pwr,oscspec)
      dimension oscspec(1000)
      parameter(pi=3.14159,earth_rad_sq=4.059e7)
c parameters from arXiv:1409.5439
c Gonzalez-Garcia et al. JHEP 11(2014)52
      parameter (dmsq21=7.50e-5,ddmsq21=0.19e-5)
      parameter (s2t13=0.0218,ds2t13=0.0010)
      parameter (s2t12=0.304,ds2t12=0.013)
      c4t13=(1.-s2t13)*(1.-s2t13)
      s22t12=4.*s2t12*(1.-s2t12)
      oscarg=1.27*dmsq21*dist*1000.
      flux=pwr*earth_rad_sq/(dist*dist)
      do jj=1,1000
         oscspec(jj)=0.0
      end do
      do k=180,1000
         enu=float(k)*.01
         pee=c4t13*(1.-s22t12*sin(oscarg/enu)**2)+s2t13*s2t13
         oscspec(k)=pee*flux
      end do
      return
      end
