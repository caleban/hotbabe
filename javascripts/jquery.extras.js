
(function($){
  // uses http://fgnass.github.com/spin.js/
  $.fn.spin = function(options){
    var options = options || { color: '#fff' }
    ;

    return this.each(function(){
      var element = this
        , spinner
      ;

      if (options.stop){
        $(element).data('spinner').stop();
        $(element).data('spinner', null);
      } else {
        // out with the old
        if ($(element).data('spinner')){
          $(element).data('spinner').stop();
          $(element).data('spinner', null);
        }

        spinner = new Spinner({ color: '#f0f0f0' }).spin(element);

        $(element).data('spinner', spinner);
      }
    });
  },

  $.fn.center = function(axis) {

    var axis = axis || 'vertical'
    ;

    return this.each(function(){
      var element = this
        , parent = $(element).parent()
        , offset = $(parent).outerHeight()/2 - $(element).outerHeight()/2
      ;

      $(element).css({ 'margin-bottom': '0px'
        , 'margin-top': offset + 'px'
      });
    });
  };

  $.fn.fill = function() {
    return this.each(function(){
      var element = this
        , parent = $(element).parent()
      ;

      $(element).css({
        width: $(parent).width()
          - parseInt($(parent).css('padding-left'))
          - parseInt($(parent).css('padding-right'))
          - parseInt($(element).css('padding-right'))
          - parseInt($(element).css('padding-left'))
          - parseInt($(element).css('border-left-width'))
          - parseInt($(element).css('border-right-width'))
      });
    });
  };

  // Loops over the inputs and converts their values into a json object
  // <input name="name" value="sleepy" />
  //    //=> { name: 'sleepy' }
  //
  // <input name="account[name]" value="sleepy" />
  //    //=> { account: { name: 'sleepy' } }
  //
  // <input name="account[emails][]" value="sleepy@7dwraves.com" />
  //    //=> { account: { emails: [ 'sleepy@7dwraves.com' ] } }
  //
  $.fn.serializeJSON = function(){
    var element = this
      , inputs = $(element).serializeArray()
      , json = {}
    ;

    $.each(inputs, function(index, input){
      // console.log('this', this);
    });
  };
})(jQuery);


// #### helpers.center.horizontal(selector)
//
// Return the maximum width in pixels allowed to make a child element fill
// in the `selector`, accounts for padding on the `selector`:
//
//      $('#my-id').css({
//        width: helpers.fill('#parent-selector')
//      });
//
// This will set the width of the `#my-id` selector to the maximum
// possible width allowed to fill in the `#parent-selector` element
// accounting for the `#parent-selector`'s padding.
// fill: function(selector){
//   return $(selector).width()
//     - parseInt($(selector).css('padding-right'));
// },