
var Baseline = function(options){
  var baseline = this
    , options = options || {}
  ;

  baseline.options = _.defaults(options, {
    colors: { 'line-height': 'rgba(255, 255, 255, 0.8)'
      , 'median': 'rgba(255, 0, 255, 0.2)'
      , 'baseline': 'rgba(0, 0, 255, 0.8)'
      , 'gutters': 'rgba(238, 238, 238, 0.45)'
    }
  });

  // per the spec the width/ height needs to be set in pixels on the el
  baseline.canvas = $('<canvas>').attr({
    width: $('html').outerWidth(),
    height: $('html').outerHeight(),
    id: 'baseline-grid'
  }).css({
    position: 'absolute',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    'z-index': 2000,
    display: 'none'
  }).click(function(){
    $(this).hide();
  });

  baseline.controls = $('<div />').attr({
    id: 'baseline-controls'
  }).css({
    position: 'fixed',
    left: 0,
    bottom: 0,
    'margin-bottom': '-0.28125em',
    'margin-left': '-0.5625em',
    background: 'rgba(0, 0, 0, 0.82)',
    'z-index': 150,
    color: '#f0f0f0',
    padding: '0.5625em 1.125em',
    'font-size': '12px',
    'border-top-right-radius': '0.5625em',
    'font-style': 'italic',
    'cursor': 'pointer'
  }).html([
    '<em>baseline.js<em>',
    // '<strong>/</strong>',
    // '<a href="#" class="select">select</a>',
    // '<strong>/</strong>',
    // '<a href="#" class="close">x</a>'
  ].join(' ')).click(function(event){
    event.preventDefault();
    event.stopPropagation();

    baseline.canvas.toggle();
  });

  baseline.context = baseline.canvas[0].getContext('2d');

  baseline.inject();
  baseline.draw();
};

Baseline.prototype.draw = function(){
  var baseline = this
    , calculations = baseline.calculate()
    , height = baseline.canvas.outerHeight()
    , width = baseline.canvas.outerWidth()
    // http://diveintohtml5.info/canvas.html#pixel-madness
    , offset = 0.5
  ;



  // ## line-height
  baseline.context.beginPath();

  for (var y = offset; y < height; y += calculations['line-height']) {
    baseline.context.moveTo(0, y + calculations['line-height']);
    baseline.context.lineTo(width, y + calculations['line-height']);
  }

  baseline.context.strokeStyle = baseline.options.colors['line-height'];
  baseline.context.stroke();

  // ## median
  baseline.context.beginPath();

  for (var y = calculations.median+offset; y < height; y += calculations['line-height']) {
    baseline.context.moveTo(0, y + calculations['line-height']);
    baseline.context.lineTo(width, y + calculations['line-height']);
  }

  baseline.context.strokeStyle = baseline.options.colors.median;
  baseline.context.stroke();

  // baseline
  baseline.context.beginPath();

  for (var y = calculations['baseline']+offset; y < height; y += calculations['line-height']) {
    baseline.context.moveTo(0, y + calculations['line-height']);
    baseline.context.lineTo(width, y + calculations['line-height']);
  }

  baseline.context.strokeStyle = baseline.options.colors.baseline;
  baseline.context.stroke();

  // gutter
  baseline.context.beginPath();

  for (var x = calculations['line-height']/2+offset; x < width; x += calculations['line-height']*2) {
    baseline.context.moveTo(x + calculations['line-height'], 0);
    baseline.context.lineTo(x + calculations['line-height'], height);
  }

  baseline.context.lineWidth = calculations['line-height'];
  baseline.context.strokeStyle = baseline.options.colors.gutters;
  baseline.context.stroke();

  // edges
  baseline.context.beginPath();
  // left
  baseline.context.moveTo(calculations['line-height']+offset, 0)
  baseline.context.lineTo(calculations['line-height']+offset, height);
  // top
  baseline.context.moveTo(0, calculations['line-height']+offset)
  baseline.context.lineTo(height, calculations['line-height']+offset);
  // right
  baseline.context.moveTo(offset+width-calculations['line-height'], 0)
  baseline.context.lineTo(offset+width-calculations['line-height'], height);
  // bottom
  baseline.context.moveTo(0, offset+height-calculations['line-height'])
  baseline.context.lineTo(height, offset+height-calculations['line-height']);

  baseline.context.lineWidth = 1;
  baseline.context.strokeStyle = 'rgba(255, 0, 255, 0.8)';
  baseline.context.stroke();

  // verts
  _.each(baseline.options.verticals, function(line){
    baseline.context.beginPath();

    var x = (line.x*calculations['line-height'])+offset

    baseline.context.moveTo(x, 0)
    baseline.context.lineTo(x, height);

    baseline.context.lineWidth = line.width;
    baseline.context.strokeStyle = line.color;
    baseline.context.stroke();
  });
};

Baseline.prototype.calculate = function(){
  var baseline = this
    , p = $('<p />')
  ;

  baseline.calculations = {};

  // inject it so it gets the style
  $('body').append(p);

  // Save the raw html el for later
  baseline.p_ = p[0];

  // baseline.p_ = document.createElement('p');
  // baseline.p_.text = 'baseline.js';
  // document.body.appendChild(baseline.p_);

  var style = window.getComputedStyle(baseline.p_, null);

  // TODO: make sure lineHeight this is actually set
  //     if (lineHeight === 'normal') {
  //       console.error('Woah, you need to set some style before using this. Try body { line-height: 1.125; margin: 1.125em 0;}')
  //     } else {
  //       console.debug('working with line-height: ' + lineHeight)
  //     }
  var lineHeight = parseInt(style['line-height'].replace('px', ''));
  var fontSize = parseInt(style['font-size'].replace('px', ''));

  baseline.calculations['line-height'] = lineHeight;
  baseline.calculations['font-size'] = fontSize;
  //     diff between lineHeight and fontSize divided by 2 to get the leading
  //     divide by 2 for the half leading
  //     half leading gets applied to the top and bottom halphs
  baseline.calculations['leading'] = (lineHeight - fontSize)/2;
  baseline.calculations['half-leading'] = (lineHeight - fontSize)/4;

  baseline.calculations['median'] = (lineHeight - fontSize)/2 * 4;
  baseline.calculations['baseline'] = fontSize - (lineHeight - fontSize);

  return baseline.calculations;
};

Baseline.prototype.inject = function(){
  var baseline = this
  ;

  $('body')
    .prepend(baseline.canvas)
    .prepend(baseline.controls);
};

Baseline.prototype.isInjected = function(){
  return $('#baseline-grid').length === 1;
};

Baseline.prototype.show = function(){
  var baseline = this
  ;

  if (! baseline.isInjected()) {
    baseline.inject();
    baseline.draw();
  }

  return $(baseline.canvas).show();
};

Baseline.prototype.hide = function(){
  return $(baseline.canvas).hide();
};
