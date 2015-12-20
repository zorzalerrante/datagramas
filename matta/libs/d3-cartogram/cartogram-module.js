define(['d3', './cartogram'],
    function(d3, c) {
      "use strict";
      console.log('in cartogram module', d3, c);
      var cartogram = d3.cartogram;
      console.log(cartogram, d3);
      //delete d3['cartogram'];
      return cartogram;
    });