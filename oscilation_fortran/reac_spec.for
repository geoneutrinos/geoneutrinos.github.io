      program reac_spec
      dimension spectrum(1000)
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
         if((k.gt.179).and.(k.lt.950))then
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
      return
      end
