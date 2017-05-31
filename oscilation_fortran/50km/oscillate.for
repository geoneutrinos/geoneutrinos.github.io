      program oscillate
      dimension flux_reac(1000)
c ocillation parameters from Gonzales-Garcia et al. 2014
      data dmsq21/7.50d-5/
      data dmsq/2.45d-3/
      data s2th12/0.304d+0/
      data s2th13/0.0218d+0/
C calculate mixing factors
      c2th12=1d+0-s2th12
      s22th12=4.0d+0*s2th12*(1.0d+0-s2th12)
      s22th13=4.0d+0*s2th13*(1.0d+0-s2th13)
      c4th13=(1.0d+0-s2th13)*(1.0d+0-s2th13)
c normal hierarchy of neutrino masses
      dmsq31=dmsq
      dmsq32=dmsq31-dmsq21
c inverted hierarchy of neutrino masses
c      dmsq32=dmsq
c      dmsq31=dmsq32-dmsq21
      distance=50.0d+0
      argo21=1.27d+0*dmsq21*distance*1000.0d+0
      argo31=1.27d+0*dmsq31*distance*1000.0d+0
      argo32=1.27d+0*dmsq32*distance*1000.0d+0
      do k=1,1000
         flux_reac(k)=0.000000d+0
      end do
      open(33,file='oscillate_50km.dat',status='new')
      do k=1,1000
         enu=float(k)*.01d+0
         supr21=c4th13*s22th12*sin(argo21/enu)**2
         supr31=s22th13*c2th12*sin(argo31/enu)**2
         supr32=s22th13*s2th12*sin(argo32/enu)**2
         suprb=1.-supr21-supr31-supr32 
         print *,k,suprb
         flux_reac(k)=suprb
         write(33,333) suprb
      end do
      close(33)
333   format(2x,f8.6)
      return
      end
