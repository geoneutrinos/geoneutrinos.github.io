      program reactor
c reads reactor positions and powers from JGL files
      dimension spectrum(1000),reac_spec(1000),full_spec(1000),
     +dc_spec(1000),so_spec(1000),detecspec(1000),fixup(1000),
     +reac_unosc_spec(1000),unosc_spec(1000),smear_spec(1000)
      dimension flat(272),flon(272),fpwr(272)
      dimension fdst(272,16),fint(272,16),fangle(90,16)
      dimension fintdst(13000,16),fmaxdst(16),totint(16)
      dimension raylaid(5000),rayfix(5000)
c Detector coordinates
c 1)KL, 2)BX, 3)S+, 4)DU, 5)BK, 6)LE, 7)FR, 
c 8)Andes, 9)INO, 10)WIPP, 
c 11)Canfranc, 12)Boulby, 13)Jinping, 14)Soudan, 15)IMB, 16)KURF
      dimension dlat(16),dlon(16),fintmax(16),rlat(16),rlon(16)
      data id1/1/
      data id2/16/
      data dlat/36.43,42.45,46.47,44.35,43.24,63.66,
     +45.141,-30.20,9.95,32.37,42.75,54.55,28.18,
     +47.82,41.753,37.37/
      data dlon/137.31,13.57,-81.20,-103.75,42.70,26.05,
     +6.69,-69.85,77.28,-103.79,-0.50,-0.82,101.62,
     +-92.24,-81.286,-80.68/
c reactor spectral fit parameters- empirical from JGL
      data e1/0.8/
      data e2/1.43/
      data e3/3.2/
c energy resolution for smearing
      data error/0.03/
c reduction factor for spectral filtering theta12=0
      data reduce/0.3/
c base rate: pre-oscillation, E_nu>3.4 MeV with 100% detection efficiency
c in units of /yr/GW/10^32 free protons for reactor at earth center
      data baserate/.00808/
      open(33,file='reactor_locations.prn',status='old')
      open(44,file='reactor_powers.prn',status='old')
      do i=1,272
         fpwr(i)=0.00000
         read(33,*) flat(i),flon(i),nrctr
         if(i.ne.nrctr) print *,' Houston, we have a problem!'
      end do
      do i=1,433
         read(44,*) npwr,nrctr,ncore
c         print *,npwr,nrctr,ncore
         fpwr(nrctr)=fpwr(nrctr)+float(npwr)
      end do
      close(33)
      close(44)
      nreactor=0
      totpwr=0.00000
      do ndet=id1,id2
         fintmax(ndet)=0.00000
         totint(ndet)=0.000000
         do n=1,13000
            fintdst(n,ndet)=0.000000
         end do
         do nang=1,90
            fangle(nang,ndet)=0.00000
         end do
      end do
      do i=1,272
         if(fpwr(i).gt.0.0)then
            totpwr=totpwr+fpwr(i)
            nreactor=nreactor+1
c            print *,i,flat(i),flon(i),fpwr(i),nreactor,totpwr
            do j=id1,id2
               call arcangle(dlat(j),dlon(j),flat(i),flon(i),fdst(i,j),
     +rangle)
c               print *,i,flat(i),flon(i),fpwr(i),fdst(i,j)
               fint(i,j)=fpwr(i)/(4.*3.14159*fdst(i,j)*fdst(i,j))
               iangle=int(rangle)
               fangle(iangle,j)=fint(i,j)
               if(fint(i,j).gt.fintmax(j))then
                  fintmax(j)=fint(i,j)
                  rlat(j)=flat(i)
                  rlon(j)=flon(i)
               end if
               totint(j)=totint(j)+fint(i,j)
               idist=int(fdst(i,j))
               fintdst(idist,j)=fintdst(idist,j)+fint(i,j)
            end do
         end if
      end do
      print *,' total power of ',nreactor,' reactors is',totpwr
      print *,' opening output files'
c      open(62,file='boulby_reac_osc_nor1m.dat')
c      open(66,file='kurf_reac_osc.dat')
      do ndet=id1,id2
         fmaxint=0.000000
         do n=1,13000
            fintensity=fintdst(n,ndet)*1000.
c            write(90+ndet,999)fintensity
c            write(30+ndet,999)fintensity
            if(fintensity.gt.fmaxint)then
               fmaxint=fintensity
               maxdist=n
            end if
         end do
         print *,ndet,' tot intens (mW/m2)',totint(ndet)*1000.
         print *,ndet,' tot flux (cm2s)-1',totint(ndet)*5.e6
         print *,ndet,' intensity maximum',fmaxint,maxdist
         print *,ndet,' max lat lon',rlat(ndet),rlon(ndet)
c         close(30+ndet)
         fmaxdst(ndet)=float(maxdist)
      end do
      fluxnorm=0.00000
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
      do k=1,1000
         spectrum(k)=spectrum(k)*scale
         fluxnorm=fluxnorm+spectrum(k)
c         print *,k,spectrum(k),fluxnorm
      end do
      print *,' baserate events ',fluxnorm 
      sumpwr=0.
      sumpwd=0.
      sumpow=0.
      do j=id1,id2
         do k=1,1000
            full_spec(k)=0.000000
            unosc_spec(k)=0.000000
         end do
         do i=1,272
            if(fpwr(i).gt.0.0)then
c            if((fpwr(i).gt.0.0).and.(fdst(i,j).gt.200.))then
c              if(fdst(i,j).lt.100.)then
c                 print *,i,' pwr',fpwr(i),' dist',fdst(i,j)
c                 sumpwr=sumpwr+fpwr(i)/fdst(i,j)/fdst(i,j)
c                 sumpwd=sumpwd+fpwr(i)/fdst(i,j)
c                 sumpow=sumpow+fpwr(i)
c                 fpwr(i)=40000.
c              end if
               call get_unosc(fdst(i,j),fpwr(i),reac_unosc_spec)
               call get_spec(fdst(i,j),fpwr(i),reac_spec)
               do k=1,1000
                  full_spec(k)=full_spec(k)+reac_spec(k)
                  unosc_spec(k)=unosc_spec(k)+reac_unosc_spec(k)
               end do
            end if
         end do
         do k=1,1000
            full_spec(k)=full_spec(k)*spectrum(k)
            unosc_spec(k)=unosc_spec(k)*spectrum(k)
         end do
c subroutine gauss attempts gaussian energy smearing
c         call gauss(error,full_spec,smear_spec)
         unosc=0.00000
         runosc=0.00000
         events=0.00000
         revts=0.00000
         gevts=0.00000
         uevts=0.00000
         do k=1,1000
c            write(50+j,999) full_spec(k)
            unosc=unosc+unosc_spec(k)
            events=events+full_spec(k)
            if(k.gt.339) then
               runosc=runosc+unosc_spec(k)
               revts=revts+full_spec(k)
            else
               if(k.gt.179) gevts=gevts+full_spec(k)
               if(k.gt.230) uevts=uevts+full_spec(k)
            end if
c            fixup(k)=0.000000
         end do
c         do mang=1,90
c            write(20+j,999) fangle(mang,j)
c            print *,mang,fangle(mang,j)
c         end do
c         close(20+j)
c         close(50+j)
         hevts=events-gevts
         print *,' Intens-weighted avg dist',sumpwd/sumpwr
         print *,' Avg power',sumpwd*sumpwd/sumpwr
         print *,' Total power',sumpow
         print *,' same intens?',sumpow*(sumpwr/sumpwd)**2
         print *,' Total intensity',sumpwr
         print *,j,' unosc',unosc,runosc,unosc-runosc
         print *,j,' oscil',events,revts,events-revts
         print *,j,' tot,f_U,geo,f,(/yr)',events,uevts/gevts,
     +gevts,gevts/hevts
c make a filtered spectrum
c         filter=events*reduce/fluxnorm
c         do k=1,1000
c            print *,k,full_spec(k),spectrum(k)
c            fixup(k)=full_spec(k)-spectrum(k)*filter
c            if(fixup(k).lt.0.000000) fixup(k)=0.000000
c            write(60+j,999) fixup(k)
c         end do
c         print *,' closing 60'
c         close(60+j)
c         if(j.gt.11)then
c            print *,' calling delmsq21- first time'
c            call delmsq21(fmaxdst(j),full_spec,raylaid)
c            print *,' calling delmsq21'
c            call delmsq21(fmaxdst(j),fixup,rayfix)
c            do nray=1,5000
c               write(70+j,999) raylaid(nray)
c               write(80+j,999) rayfix(nray)
c            end do
c            print *,' closing 70 80'
c            close(70+j)
c            close(80+j)
c         end if
      end do
c      do k=1,1000
c         write(71,999) dc_spec(k)*spectrum(k)
c         write(72,999) so_spec(k)*spectrum(k)
c      end do
c      close(71)
c      close(72)
999   format(2x,f12.6)
      return
      end

      subroutine get_spec(distance,power,flux_reac)
      parameter(pi=3.14159,earth_rad_sq=4.059e7)
      dimension flux_reac(1000)
      data dmsq21/7.54e-5/
      data dmsq/2.39e-3/
      data s22th/0.858/
      data c4t13/0.949/
      data s22t13/0.1/
      data s2th12/0.306/
      data c2th12/0.694/
c normal hierarchy of neutrino masses
      dmsq31=dmsq
      dmsq32=dmsq31-dmsq21
c inverted hierarchy of neutrino masses
c      dmsq32=dmsq*.97
c      dmsq31=dmsq32-dmsq21
      argo21=1.27*dmsq21*distance*1000.
      argo31=1.27*dmsq31*distance*1000.
      argo32=1.27*dmsq32*distance*1000.
      pwr_re=power/1000.
      flux=pwr_re*earth_rad_sq/(distance*distance)
      do k=1,1000
         flux_reac(k)=0.000000
      end do
      do k=180,1000
         enu=float(k)*.01
         supr21=c4t13*s22th*sin(argo21/enu)**2
         supr31=s22t13*c2th12*sin(argo31/enu)**2
         supr32=s22t13*s2th12*sin(argo32/enu)**2
         suprb=1.-supr21-supr31-supr32
         flux_reac(k)=flux_reac(k)+flux*suprb
      end do
      return
      end

      subroutine get_unosc(distance,power,flux_reac)
      parameter(pi=3.14159,earth_rad_sq=4.059e7)
      dimension flux_reac(1000)
      pwr_re=power/1000.
      flux=pwr_re*earth_rad_sq/(distance*distance)
      do k=1,1000
         flux_reac(k)=0.000000
      end do
      do k=180,1000
         flux_reac(k)=flux_reac(k)+flux
      end do
      return
      end

      subroutine arcangle(detlat,detlon,soulat,soulon,distance,
     +alpha)
      parameter(earthr=6371.,degrad=57.2958)
c     calculates angle subtended by two
c     points on the surface of a sphere
c     input is longitude and latitude of
c     the two points
      detlt=detlat/degrad
      detln=detlon/degrad
      soult=soulat/degrad
      souln=soulon/degrad
      delphi=detln-souln
      xx=cos(soult)*sin(delphi)
      xx=xx**2
      yy=cos(detlt)*sin(soult)
      yy=yy-sin(detlt)*cos(soult)*cos(delphi)
      yy=yy**2
      zz=sqrt(xx+yy)
      xx=sin(detlt)*sin(soult)
      xx=xx+cos(detlt)*cos(soult)*cos(delphi)
      alpha=atan2(zz,xx)
      beta=alpha/2.
      distance=2.*sin(beta)*earthr
      alpha=alpha*degrad
c      print *,' angle/distance is ', alpha,distance
      return
      end

      subroutine delmsq21(baseline,spectrum,raypraw)
      dimension spectrum(1000),events(1000),detect(1000)
      dimension raypraw(5000)
      logical normal
      parameter(pi=3.14159,earth_rad=6371.)
c solar parameters KL+solar (Abe et al. 2008 PRL) theta12=34 deg
      data dmsq21/7.59e-5/
      data ssq2th12/0.87/
      data csqth12/0.6873/
      data ssqth12/0.3127/ 
c atmospheric parameters from Minos
      data dmsq32/2.34e-3/
c sub-dominant mixing angle
      data ssq2th13/0.003/
c set normal or inverted neutrino mass hierarchy
      data normal/.true./   
c detector energy resolution
      data sigma/0.06/
c zero arrays
      do k=1,1000
         events(k)=0.000000  
      end do
      call gauss(sigma,spectrum,events)
      avgbline=baseline*1000.
      call rayleigh(avgbline,events,raypraw,dmsqbst,biglogp)
      print *,' delta mass sq',dmsqbst,biglogp
888   format(2x,f12.6)
      return
      end

      subroutine gauss(errsig,array,smear)
      dimension array(1000),probs(300),smear(1000),
     +buffer(1000)  
      data probs/.004,.008,.012,.016,.0199,.0239,.0279,.0319,
     +.0359,.0398,.0438,.0478,.0517,.0557,.0596,.0636,.0675,
     +.0714,.0753,.0793,.0832,.0871,.0910,.0948,.0987,.1026,
     +.1064,.1103,.1141,.1179,.1217,.1255,.1293,.1331,.1368,
     +.1406,.1443,.1480,.1517,.1554,.1591,.1628,.1664,.1700,
     +.1736,.1772,.1808,.1844,.1879,.1915,.1950,.1985,.2019,
     +.2054,.2088,.2123,.2157,.2190,.2224,.2257,.2291,.2324,
     +.2357,.2389,.2422,.2454,.2486,.2517,.2549,.2580,.2611,
     +.2642,.2673,.2704,.2734,.2764,.2794,.2823,.2852,.2881,
     +.2910,.2939,.2967,.2995,.3023,.3051,.3078,.3106,.3133,
     +.3159,.3186,.3212,.3238,.3264,.3289,.3315,.3340,.3365,
     +.3389,.3413,.3438,.3461,.3485,.3508,.3531,.3554,.3577,
     +.3599,.3621,.3643,.3665,.3686,.3708,.3729,.3749,.3770,
     +.3790,.3810,.3830,.3849,.3869,.3888,.3907,.3925,.3944,
     +.3962,.3980,.3997,.4015,.4032,.4049,.4066,.4082,.4099,
     +.4115,.4131,.4147,.4162,.4177,.4192,.4207,.4222,.4236,
     +.4251,.4265,.4279,.4292,.4306,.4319,.4332,.4345,.4357,
     +.4370,.4382,.4394,.4406,.4418,.4429,.4441,.4452,.4463,
     +.4474,.4484,.4495,.4505,.4515,.4525,.4535,.4545,.4554,
     +.4564,.4573,.4582,.4591,.4599,.4608,.4616,.4625,.4633,
     +.4641,.4649,.4656,.4664,.4671,.4678,.4686,.4693,.4699,
     +.4706,.4713,.4719,.4726,.4732,.4738,.4744,.4750,.4756,
     +.4761,.4767,.4772,.4778,.4783,.4788,.4793,.4798,.4803,
     +.4808,.4812,.4817,.4821,.4826,.4830,.4834,.4838,.4842,
     +.4846,.4850,.4854,.4857,.4861,.4864,.4868,.4871,.4875,
     +.4878,.4881,.4884,.4887,.4890,.4893,.4896,.4898,.4901,
     +.4904,.4906,.4909,.4911,.4913,.4916,.4918,.4920,.4922, 
     +.4925,.4927,.4929,.4931,.4932,.4934,.4936,.4938,.4940,
     +.4941,.4943,.4945,.4946,.4948,.4949,.4951,.4952,.4953,
     +.4955,.4956,.4957,.4959,.4960,.4961,.4962,.4963,.4964,
     +.4965,.4966,.4967,.4968,.4969,.4970,.4971,.4972,.4973,
     +.4974,.4974,.4975,.4976,.4977,.4977,.4978,.4979,.4979,
     +.4980,.4981,.4981,.4982,.4982,.4983,.4984,.4984,.4985,
     +.4985,.4986,.4986,.4987/
      do k=1,1000
         smear(k)=0.00000
         buffer(k)=0.00000
      end do
      do j=1,1000
         if(array(j).gt.0.)then
            sum=0.00000
            enu=(float(j)+0.5)/100.
            hafsig=errsig*sqrt(enu-0.8)/2.
            b_0=0.005/hafsig
            ismr=int(b_0*100.)
            buffer(j)=array(j)*probs(ismr)*2.
            sum=sum+buffer(j)
            incr=0
            do while(ismr.lt.300)
               incr=incr+1
               bin=0.005+incr*0.01
               b_i=bin/hafsig
               ismr_i=int(b_i*100.)
               if(ismr_i.lt.300)then
                  prob=probs(ismr_i)-probs(ismr)
                  buffer(j-incr)=buffer(j-incr)+array(j)*prob
                  buffer(j+incr)=buffer(j+incr)+array(j)*prob
                  sum=sum+buffer(j-incr)+buffer(j+incr)
               end if
               ismr=ismr_i
            end do
            diff=array(j)-sum
            if(diff.lt.0.00000)then
               print *,' *** NORMALIZATION ERROR ***'
               print *,j,diff,array(j),sum
            else
               buffer(j)=buffer(j)+diff/3.
               buffer(j-1)=buffer(j-1)+diff/3.
               buffer(j+1)=buffer(j+1)+diff/3.
               sum=sum+diff
c               print *,diff,sum,buffer(j),buffer(j-1),buffer(j+1),incr
            end if
         end if
         do k=1,1000
            smear(k)=smear(k)+buffer(k)
            buffer(k)=0.00000
         end do
      end do      
      return      
      end         

      subroutine rayleigh(dist,bin,rayspec,bestdmsq,biggest)
      dimension bin(1000),rayspec(5000)
c sweep over delta mass squareds
      biggest=-999999.   
      do k=1,5000
         delmsq=float(k)*1.0e-7
         factor=1.27*dist*delmsq
         sum=0.00000  
         ctot=0.00000
         stot=0.00000
         rayspec(k)=0.00000
         do i=1,1000
            if((i.gt.179).and.(i.lt.900)) then
               enu=float(i)/100.
               ang=factor/enu*2.
               cang=cos(ang)
               sang=sin(ang)
               sum=sum+bin(i)
               ctrm=bin(i)*cang
               strm=bin(i)*sang
               ctot=ctot+ctrm
               stot=stot+strm
            end if
         end do
         pwr=(ctot*ctot+stot*stot)/sum
         rayspec(k)=log(pwr)
         if(k.gt.300)then
            if(rayspec(k).gt.biggest)then
               biggest=rayspec(k)
               bestdmsq=delmsq
            end if
         end if
c         prob=exp(-pwr)
      end do
      return
      end

