      program geoflux
* whole earth
      print *, ' whole earth factor = '
      a=0.
      b=6.3709
      call integrate(a,b,phi)
* inner core
      print *, ' inner core factors ' 
      a=0.
      b=0.2
      call integrate(a,b,phi)
      do i=1,5
         a=b
         b=b+0.2
         call integrate(a,b,phi)
      end do
      a=b
      b=1.2215
      call integrate(a,b,phi)
* outer core
      print *, ' outer core factors '
      a=b
      b=1.4
      call integrate(a,b,phi)
      do i=1,10
         a=b
         b=b+0.2
         call integrate(a,b,phi)
      end do
      a=b
      b=3.480
      call integrate(a,b,phi)
* D"
      print *, ' D" factors '
      a=b
      b=3.60
      call integrate(a,b,phi)
      a=b
      b=3.63
      call integrate(a,b,phi)
* lower mantle
      print *, ' lower mantle factors '
      a=b
      b=3.80
      call integrate(a,b,phi)
      do i=1,9
         a=b
         b=b+0.2
         call integrate(a,b,phi)
      end do
      a=b
      b=5.701
      call integrate(a,b,phi)
* transition zone
      print *, ' transition zone factors '
      a=b
      b=5.771
      call integrate(a,b,phi)
      a=b
      b=5.871
      call integrate(a,b,phi)
      a=b
      b=5.971
      call integrate(a,b,phi)
      a=b
      b=6.061
      call integrate(a,b,phi)
      a=b
      b=6.151
      call integrate(a,b,phi)
* low velocity  zone
      print *, ' low velocity zone factors '
      a=b
      b=6.221
      call integrate(a,b,phi)
      a=b
      b=6.291
      call integrate(a,b,phi)
* LID
      print *, ' LID factor = '
      a=b
      b=6.3466
      call integrate(a,b,phi)
* crust
      print *, ' crust factor = '
      a=b
      b=6.368
      call integrate(a,b,phi)
* ocean
      print *, ' ocean factor = '
      a=b
      b=6.3709
      call integrate(a,b,phi)
* earth-centered geo-reactor
      print *, ' earth-centered geo-reactor'
      a=0.000
      b=0.331
      call integrate(a,b,phi)
* inner-outer core geo-reactor
      print *, ' inner-outer core geo-reactor'
      a=1.222
      b=1.230
      call integrate(a,b,phi)
* core-mantle geo-reactor
      print *, ' core-mantle geo-reactor'
      a=3.480
      b=3.481
      call integrate(a,b,phi)
* oceanic planet 
      print *,' oceanic planet'
      a=6.365
      b=6.3709
      call integrate(a,b,phi)
* continental planet 
      print *,' continental planet'
      a=6.337
      b=6.3709
      call integrate(a,b,phi)
      stop
      end

      subroutine integrate(a,b,phi)
      parameter(earth=6.371)
      top=1.+b/earth
      bot=1.+a/earth
      term1=(alog(top)/2.-0.25)*top**2
      term2=(alog(bot)/2.-0.25)*bot**2
      term3=top*alog(top)-top
      term4=bot*alog(bot)-bot
      phi=term1-term2-term3+term4
      top=1.-b/earth
      bot=1.-a/earth
      term1=(alog(top)/2.-0.25)*top**2
      term2=(alog(bot)/2.-0.25)*bot**2
      term3=top*alog(top)-top
      term4=bot*alog(bot)-bot
      phi=phi-(term1-term2-term3+term4)
      phi=phi*earth/2.
      print *,a,b,phi
      return
      end
