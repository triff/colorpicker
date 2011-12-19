///////////////////////////////////////////////////////
// Basic Color Picker (github.com/triff/colorpicker) //
///////////////////////////////////////////////////////

(function($) {

  // jQuery plugin
  $.fn.colorpicker = function(settings){
    settings      = settings || {};
    settings.bind = settings.bind || "click";
    $(this).bind(settings.bind, function(e){ cpk._parent = $(this); cpk.settings = settings; cpk.register(); e.stopPropagation(); });
  };

  var cpk = {};
  cpk.saturation = {}, cpk.hue = {}, cpk.calc = {};
  cpk._hsv = { h:0, s:0, v:0 };

  // only a single colorpicker should be active at any time
  cpk.singleton = function(){
    var _cpk = $("#cpk-colorpicker");
  
    if (!_cpk.length) {
      _cpk = $('<div id="cpk-colorpicker"><div id="cpk-sat-picker"><div id="cpk-sat-cursor" class="cpk-cursor" style="left:-4px;top:-4px;"></div></div><div id="cpk-hue-picker"><div id="cpk-hue-cursor" class="cpk-cursor" style="top:-3px;"></div></div></div>');
      
      // set up some helpers
      cpk.saturation.picker = $("#cpk-sat-picker", _cpk);
      cpk.saturation.cursor = $("#cpk-sat-cursor", _cpk);
      cpk.hue.picker        = $("#cpk-hue-picker", _cpk);
      cpk.hue.cursor        = $("#cpk-hue-cursor", _cpk);
      
      cpk.saturation.picker.mousedown(function(e){
        cpk.saturation.update(e);
        $(document).mousemove(cpk.saturation.update);
      });
    
      cpk.hue.picker.mousedown(function(e){
        cpk.hue.update(e);
        $(document).mousemove(cpk.hue.update);
      });
    
      $(document).mouseup(function(){
        $(this).unbind("mousemove");
      });
    
      $(document).click( function(){ //?
        cpk.close();
      });
    
      _cpk.click(function(e){
        e.stopPropagation();
      });
    }
    
    return _cpk;
  }

  cpk.register = function(){
    
    // display the colorpicker
    $("body").append(cpk.singleton());
    
    // position + offset
    cpk.settings.position = cpk.settings.position || "below";
    cpk.reposition();
    
    var color = cpk._parent.val();
    if (!color.match(/^#[0-9a-f]{6}$/i))
      color = (typeof cpk.settings.color == "function") ? cpk.settings.color(cpk._parent) : cpk.settings.color;
    if (color) cpk.set(color);
  }
  
  cpk.reposition = function(){
    var position = cpk._parent.offset();
    var offsetX  = (cpk.settings.position == "right") ? cpk._parent.outerWidth() + 5 : 0;
    var offsetY  = (cpk.settings.position == "below") ? cpk._parent.outerHeight() + 5 : 0;
    
    cpk.singleton().css({ "left": position.left + offsetX, "top": position.top + offsetY });
  }

  // force the colorpicker to close
  cpk.close = function() {
    $("#cpk-colorpicker").remove();
  }
  
  // colorpicker callback
  cpk.callback = function(){
    var color = cpk.calc.hsvToHex(cpk._hsv);
    if (cpk._parent.is("input")) cpk._parent.val(color);
    if (cpk.settings.callback) cpk.settings.callback(color, cpk._parent);
  }

  // repositions cursor and sets color values
  cpk.saturation.update = function(event)
  {
    var position = cpk.saturation.picker.offset();
  
    var x = event.pageX - Math.ceil(position.left);
    var y = event.pageY - Math.ceil(position.top);
  
    x = (x < 0)  ? 0 : x;
    x = (x > 166) ? 166 : x;
    y = (y < 0)  ? 0 : y;
    y = (y > 166) ? 166 : y;
  
    cpk.saturation.cursor.css({ "left": (x-4)+"px", "top": (y-4)+"px" });
  
    cpk._hsv.s = Math.round(x/166*100);
    cpk._hsv.v = Math.round(100-(y/166*100));
    
    cpk.callback();
  }

  // repositions cursor and sets color values
  cpk.hue.update = function(event)
  {
    var position = cpk.hue.picker.offset();
  
    var y = event.pageY - Math.ceil(position.top);
  
    y = (y < 0)  ? 0 : y;
    y = (y > 166) ? 166 : y;
    
    var offset = (y) ? 4 : 3;
  
    cpk.hue.cursor.css({ "top": (y-offset)+"px" });
    cpk._hsv.h = 360 - Math.round(y/166*360);

    // update color map
    var bg = cpk.calc.hsvToHex({ s:100, v:100, h:cpk._hsv.h });
    cpk.saturation.picker.css("background-color", bg);
    
    cpk.callback();
  }

  // reposition cursors based on hex value
  cpk.set = function(hex){
    // get the hsv color from hex
    if (hex) cpk._hsv = cpk.calc.hexToHsv(hex);
    
    var bg = cpk.calc.hsvToHex({ s:100, v:100, h:cpk._hsv.h });
    cpk.saturation.picker.css("background-color", bg);
  
    var x = cpk._hsv.s/100*166;
    var y = (100 - cpk._hsv.v)/100*166;
  
    cpk.saturation.cursor.css({ "left": (x-4)+"px", "top": (y-4)+"px" });
    
    var hy = 166 - (cpk._hsv.h/360*166);
    var offset = (hy) ? 4 : 3;
  
    cpk.hue.cursor.css({ "top": (hy-offset)+"px" });
  }

  //////////////////////////////
  // Colorpicker Calculations //
  //////////////////////////////

  // convert hsv value to rgb
  // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  cpk.calc.hsvToRgb = function(hsv) {

    var r, g, b;
    var h = hsv.h/360, s = hsv.s/100, v = hsv.v/100;
  
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    return { "r": r * 255, "g": g * 255, "b": b * 255 };
  }

  // convert rgb value to hsv
  // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  cpk.calc.rgbToHsv = function(rgb) {

    r = rgb.r/255, g = rgb.g/255, b = rgb.b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
    
      h /= 6;
    }

    return { "h": h*360, "s": s*100, "v": v*100 };
  }

  // convert an integer value to hex
  // http://www.linuxtopia.org/online_books/javascript_guides/javascript_faq/rgbtohex.htm
  cpk.calc.vHex = function(n) {
    var digits = "0123456789ABCDEF";
    n = parseInt(n); if (n == 0 || isNaN(n)) return "00";
    n = Math.floor(Math.min(Math.max(0, n), 255)); 
    return digits.charAt((n-n%16)/16) + digits.charAt(n%16);
  }

  // convert rgb to hex
  cpk.calc.rgbToHex = function(rgb) {
    return "#" + cpk.calc.vHex(rgb.r) + cpk.calc.vHex(rgb.g) + cpk.calc.vHex(rgb.b);
  }

  cpk.calc.vRGB = function(n) { return parseInt(n, 16); }

  // convert hex value to rgb
  cpk.calc.hexToRgb = function(hex) {
    hex = hex.replace(/#/, "");
    return { r: cpk.calc.vRGB(hex.substring(0, 2)), g: cpk.calc.vRGB(hex.substring(2, 4)), b: cpk.calc.vRGB(hex.substring(4, 6)) };
  }

  // convert hex value to hsv
  cpk.calc.hexToHsv = function(hex){
    return cpk.calc.rgbToHsv(cpk.calc.hexToRgb(hex));
  }

  // convert hsv value to hex
  cpk.calc.hsvToHex = function(hsv){
    var c = cpk.calc.hsvToRgb(hsv);
    return cpk.calc.rgbToHex(c);
  }

})(jQuery);