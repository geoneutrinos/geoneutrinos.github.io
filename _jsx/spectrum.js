/*
Initalize the array and constants, this is almost
identical to the fortran except for the syntax.
 */
var spectrum = new Array(1000);
var e1 = 0.8;
var e2 = 1.43;
var e3 = 3.2;
var baserate = 0.00808;

// are all uninitialized variables in fortran 0?
var fluxnorm = 0;

/*
   In javascript current best way of looping through an array
   is to make counter variable (by convention i), the second 
   part of the loop is a test, in this case, that the counter i
   is not larger than the array is long, the third and final part
   of the loop is the action to be performed on the counter
   on each itteration, in this case it is incrimented by on (i++)

   javascript array indexes start at 0 instead of 1. This has the
   effect of having all the indicie tests be minus one from the
   fortran.
 */
for (var i=0; i < spectrum.length; i++){
  spectrum[i] = 0;
  if ((i > 178) && (i < 949)){
    var enu = i/100;
    // In javascript, to do x^y you need to call Math.pow(x, y)
    // Lets store the two parts seperately, then call the e^n function
    var p1 = Math.pow((enu-e2), 2);
    var p2 = -Math.pow((enu+e1)/e3, 2);
    spectrum[i] = p1 * Math.exp(p2);
    if (i > 338){
      // the += operator works as follows: a += b is identical to a = a + b
      fluxnorm += spectrum[i];
    }
  }
}
var scale = baserate/fluxnorm;
for (var i=0; i < spectrum.length; i++){
  spectrum[i] = spectrum[i] * scale;
}

export default spectrum;
