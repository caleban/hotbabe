var Spire = require('./spire.io.js');

window.spire = new Spire({ });
var random_channel_name=""+Math.floor(Math.random()*1000000)
var answers = ['Go to hell!', 
  'You were supposed to pick me up an hour ago!', 
  'I hate you!', 
  'I can\'t believe you just said that', 
  'You\'re so boring...', 
  'I love you <3',
  'Yeah, whatever, but "that" doesn\'t happen to all guys'
];

spire.start('Ac-TwkM5rX6aVLpFeuxhyLEEQ-gxM', startChat);

function startChat () {
  spire.subscribe(random_channel_name, random_channel_name, function(err, subscription){
    if (err) throw err;
    $('input').removeAttr("disabled");
    $('input').val('');
    $('input').focus();
    
    subscription.addListener('messages', function (messages) {
	
      $(messages).each(function(i, rawMessage){
		
		var message = {content:rawMessage.content,
			date:999,
			author: 'You: '
			}

        // Create a DOM element using the Mustache template (don't add it to the
        // page yet!).
        messageElement = $(ich.message(message));
		console.log(ich.message(message))

        // Alright, done messing around lets add the `messageElement` to the
        // page and scroll to it, (saving this step to the end helps keep the
        // reflows down).
        $('.text').append($(messageElement)).scrollTo($(messageElement));
      }); // $(messages)
    }); // addListener
    subscription.startListening({orderBy: 'asc'});
  }); // subscribe
};

// ## The Message Submission Form
//
// The footer form is what handles the actual messages going to everyone in
// the room. Anything a person types and submits into the form will be
// displayed to everyone in the room.
$(document).ready(function() {
	if (spire.session) {
	  $('input').removeAttr("disabled");
	    $('input').val('');
	    $('input').focus();
    }
	$('form.message').submit(function(event){
	  event.stopPropagation();
	  event.preventDefault();

	  var form = this
	    , message = $(form).find('input[name="content"]').val();

	  // No message content? don't do anything.
	  if (! message) return;

	  // Send the message constructed above, once the message is sent the
	  // `callback` will remove the submitted text and re-focus the input
	  spire.channel(random_channel_name, function (err, channel) {
	    channel.publish(message, function (err, e){
	      if (err) throw err;
	      setTimeout(function(){
			var message = {content:answers[Math.floor(Math.random()*answers.length)],
			  date:999,
			  author: 'Hot Babe: ',
			  isBabe: true
			}
		    messageElement = $(ich.message(message));
		    $('.text').append($(messageElement)).scrollTo($(messageElement));
	      }, 3000);         

	      $(form).find('input').val('').focus();
	    });
	  });
	});
});

