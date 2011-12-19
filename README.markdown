# jQuery Colorpicker

A basic colorpicker plugin for jQuery.

# Getting Started

1. To get started you will need to download or clone a copy of the colorpicker.
2. You will need to add the following to the head of your html document.

    <link href="css/colorpicker.css" rel="stylesheet" type="text/css" />
    <script src="js/colorpicker.js" type="text/javascript"></script>
    
3. You will then need to initialize the colorpicker on the elements you wish to show it from.

    <script type="text/javascript">
      var settings = { callback: function(color, el){ alert(color); }};
      $("input.colorpicker").colorpicker(settings);
    </script>

4. That's it! Tweak the settings and go.

# Settings

- bind: An event to bind the colorpicker to, defaults to "click".
- callback: A function to be called when the color is updated. It will be passed the color and the element that it was called on.
- color: A default color to be used when initialized.
- position: Can be set to "below" or "right".

## A note on callback

If the bound element is an input tag, the colorpicker will automatically set the value.