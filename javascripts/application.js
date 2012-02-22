$.ajaxSetup({
  beforeSend: function(xhr) {
    // Get the browser to set the "Origin" header
    xhr.withCredentials = true;
  }
});

$(document).ready(function(){
  var Spire = require('./spire.io.js');
  window.spire = new Spire();

  // $("p:contains('@')").each(function() {
  //   var el = $(this)
  //     , html = el.html()
  //   ;
  //
  //   el.html(html.replace(/(\w+@\w+\.\w+)/g,function(email) {
  //     return "<a href='mailto:"+email+"'>"+email+"</a>";
  //   }));
  // });
  //
  // var spireLogoHTML = "<a class='logo' href='/'>"
  //   + "spire" + "<span class='grey'>.</span>"
  //   + "<span class='blue'>io</span></a>";
  // $("p:contains('spire.io')").each(function() {
  //   var el = $(this)
  //     , html = el.html()
  //     ;
  //   el.html(html.replace(/^spire\.io/g, spireLogoHTML ));
  //   el.html(html.replace(/\sspire\.io/g, " " + spireLogoHTML ));
  // });

  if (location.port === '9999') spire.options.url = 'http://localhost:1337'
  if (location.port === '1336') spire.options.url = 'http://localhost:1337'

  if (console) console.log("Using spire.io URL: " + spire.options.url);

  window.app = {
    flash: humane,
    // Handles setting the cookie if a new session is passed in, if the
    // session is left out then it will try and retrieve the account based on
    // the stored session information
    //
    //     app.login(session, function(err, account){
    //       alert('good work ' + account.name + '!');
    //     });
    //
    // Or:
    //
    //     app.login(function(err, account){
    //       alert('welcome back ' + account.name)
    //     });
    //
    login: function(session, callback){
      if (typeof session === 'function') {
        callback = session;
        session = null;
      }

      var data
      ;

      if (session) {
        data = { url: session.url, capability: session.capability };
        days = 2;

        monster.set('session', data, 2);

        app.account_ = session.resources.account;
        app.updateHeader();

        return callback(null, session.resources.account);
      }

      if (!session && app.account_) {
        app.updateHeader();

        return callback(null, app.account_);
      } else {
        app.loginViaCookie(function(err, account){
          app.account_ = account;
          app.updateHeader();

          return callback(err, app.account_);
        });
      }
    },
    loginViaCookie: function(callback){
      var session = monster.get('session')
      ;

      // does it exist?
      // no trigger callback with error
      if (!session) return callback(new Error('No Session Cookie!'));

      // yes - start the login process same as the login form
      // get the session resource from the API

      // session.get
      spire.requests.description.get(function(){
        $.ajax({ type: 'get'
          , url: session.url
          , beforeSend: function(xhr){ xhr.withCredentials = true; }
          , headers: { 'Accept': spire.headers.mediaType('session')
            , 'Authorization': spire.headers.authorization(session)
            }
          , dataType: 'json'
          , error: function(xhr){
              callback(new Error('XHR ERR! Couldn\'t get the session'));
            }
          , success: function(session, status, xhr){
              callback(null, session.resources.account);
            }
        });
      })
    },
    logout: function(){
      // TODO: DELETE the session
      monster.remove('session');
    },
    isLoggedIn: function(){
      return !!app.account_;
    },
    updateHeader: function(){
      var linksTemplate = ich['navigation-links']
        , bodyHasClass = $('body').attr('class') || false
        , dir
        , html
      ;

      if (app.isLoggedIn()) {
        html = linksTemplate({ isLoggedIn: app.isLoggedIn }, true)

        $('nav .navigation-links').each(function(el){
          $(this).replaceWith(html);
        });
      }

      // figure out what part of the site we are on and update the nav
      if (bodyHasClass) {
        dir = $('body').attr('class').replace(/(-.*$)/, '');

        $('.navigation-links').removeClass('current');
        $('.navigation-links .' + dir).addClass('current');
      }
    },
    alignLayout: function(){
      $('header#landing .logo').center('vertical');
    },
    redirect: function(url, data){
      var data = data || {}
      ;

      if (data.notice) app.flash(data.notice);
      if (data.error) app.flash.error(data.error);

      return History.pushState(data, data.title, url);
    },
    account: function(){
      return app.isLoggedIn() ? JSON.parse($.cookie('account')) : false;
    },
    router: new Router({
      '/account/index.html': function(state){
        app.login(function(err, account){
          if (err) return app.redirect('/login.html', {
            error: 'Try Logging In First.'
          });

          var template = ich['account-form']
          ;

          $('.account-form-holder').html(template(account));
        });
      },
      '/docs/api/reference.html': function(state) {
        $.ajax({ type: 'get'
          , url: spire.options.url
          , dataType: 'html'
          , error: console.error
          , success: function(data, status, xhr){
              $('div.api-reference').html(data);
              makeTOC();
            }
          });
      },
      // general callback for all statechange events gets called before the
      // individual route callbacks
      all: function(route, state){
        var router = this
        ;

        // Make sure all possible home routes map correctly
        if (route === '' || route === '/') route = '/index.html';

        // If there is content for the route show it dynamically
        if (app.content[route]){
          $('#content .center .padding').html(app.content[route]);
        } else {
          throw new Error('No haiku content for ' + route);
        }

        // Do any special sauce for specific routes now
        router.trigger(route);
      }
    })
  };

  app.alignLayout();

  $.getJSON('/haiku.json', function(data, status){
    $.each(data.templates, function(i, template){
      // mustache unescape
      var content = template.content
        .replace(/%7B%7B%7B/g, '{{{').replace(/%7D%7D%7D/g, '}}}')
        .replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}')

      ich.addTemplate(template.name, content);
      ich.addPartial(template.name, content);
    });

    window.app.content = data.content;

    app.login(function(err, account){
      if (err) app.logout();

      app.router.trigger('current');
    });
  });

  $('#registration-form').submit(function(event){
    event.preventDefault();
    event.stopPropagation();

    var form = this
      , emailEL = $(form).find('input[name="account[email]"]')
      , passwordEL = $(form).find('input[name="account[password]"]')
      , account = { email: emailEL.val() || ''
        , password: passwordEL.val() || ''
        }
      , messages = $('<ul />').addClass('messages')
      , errors = []
    ;

    $(form).spin();

    $('.messages').remove();

    spire.accounts.create(account, function(err, session){
      $(form).spin({ stop: true });

      if (err) {
        if (err.status === 409){
          var li = $('<li />').html([ 'Woah!'
              , 'There is already an account with that email.'
              , 'Try <a href="/login.html">logging in instead</a>'
              ].join(' '))
          ;
        } else {
          var li = $('<li />').html([ 'Woah!'
              , 'There was a problem with your submission, make sure your'
              , ' email is correct and your password is MORE than 6'
              , ' characters long.'
              ].join(' '))
          ;
        }

        $(messages).append(li);
        $(form).append(messages);
      } else {
        app.login(session, function(err, account){
          if (err) throw err;

          app.redirect('/account/index.html', {
            notice: 'Welcome!'
          });
        });
      }
    });
  });

  $('#login-form').live('submit', function(event){
    event.preventDefault();
    event.stopPropagation();

    var form = this
      , account = { email: $(form).find('input[name="account[email]"]').val()
        , password: $(form).find('input[name="account[password]"]').val()
        }
      , messages = $('<ul />').addClass('messages')
      , errors = []
    ;

    $(form).spin();

    $('.messages').remove();

    if (errors.length > 0) {
      $(form).spin({ stop: true });

      $(errors).each(function(i, error){
        $(messages).append($(error));
      });

      $(form).append(messages);

      return true;
    }

    spire.accounts.authenticate(account, function(err, session){
      $(form).spin({ stop: true });

      if (err) {
        var li = $('<li />').html([ 'Woops!'
            , 'There was a problem logging you in.'
            , 'Either there is no account with that email or'
            , 'the password you submitted is incorrect.'
            , 'Double check and resubmit...'
            ].join(' '))
        ;

        app.flash('Whoa! There was a problem logging you in.');

        $(messages).append(li);
        $(form).append(messages);
      } else {
        app.login(session, function(err, account){
          if (err) throw err;

          app.redirect('/account/index.html', {
            notice: 'Welcome Back!'
          });
        });
      }
    });
  });

  $('.logout').live('click', function(event){
    event.stopPropagation();
    event.preventDefault();

    app.logout();

    window.location = '/'
  });

  $('.keys .reset').live('click', function(event){
    event.stopPropagation();
    event.preventDefault();

    var form = this
      , account = app.account_
    ;

    $(form).spin();

    spire.requests.accounts.reset(account, function(err, session){
      if (err) throw err;

      $(form).spin({ stop: true });

      app.login(session, function(err, account){
        if (err) throw err;

        $('.key').text(account.key);
      })
    });
  });

  $('#account-form, #account-password-reset-form').live('submit', function(event){
    event.stopPropagation();
    event.preventDefault();

    var form = this
      , emailEL = $(form).find('input[name="account[email]"]')
      , passwordEL = $(form).find('input[name="account[password]"]')
      , companyEL = $(form).find('input[name="account[company]"]')
      , domainEL = $(form).find('input[name="account[domain]"]')
      , googleEL = $(form).find('input[name="account[gaID]"]')
      , nameEL = $(form).find('input[name="account[name]"]')
      , account = app.account_
      , messages = $('<ul />').addClass('messages')
      , errors = []
    ;

    account.email = $(emailEL).val();
    account.password = $(passwordEL).val();
    account.company = $(companyEL).val();
    account.domain = $(domainEL).val();
    account.gaID = $(googleEL).val();
    account.name = $(nameEL).val();

    $(form).spin();

    $('.messages').remove();

    spire.accounts.update(account, function(err, account){
      $(form).spin({ stop: true });

      if (err) throw err;

      app.flash('Your account has been successfully updated.');

      passwordEL.val('');
    })
  });

  $('#request-password-reset-form').live('submit', function(event){
    event.stopPropagation();
    event.preventDefault();

    var form = this
      , emailEL = $(form).find('input[name="account[email]"]')
      , messages = $('<ul />').addClass('messages')
    ;

    $(form).spin();

    $('.messages').remove();


    $(form).spin();

    spire.requests.description.get(function(){

      $.ajax({ type: 'post'
        , url: spire.resources.accounts.url +
          '?email=' +
          encodeURIComponent(emailEL.val())
        , headers: { 'Content-Type': spire.headers.mediaType('account')
          , 'Accept': spire.headers.mediaType('session')
          }
        , dataType: 'json'
        , complete: function(xhr, status){
            $(form).spin({ stop: true });

            var li = $('<li />').html([ 'We received your submission for a'
                , 'new password. If that email address is in our system we'
                , 'will send a message to that address shortly with'
                , 'instructions on how to reset your password.'
                ].join(' '))
            ;

            app.flash('Your request for a password reset has been received.');

            $(messages).append(li);
            $(form).append(messages);
        }
      });
    });
  });

  $('#password-reset-form').live('submit', function(event){
    event.stopPropagation();
    event.preventDefault();

    var params = $.url(window.location.href).param()
      , account = { capability: params.capability
        , url: unescape(params.url)
        }
      , form = this
      , messages = $('<ul />').addClass('messages')
    ;

    $(form).spin();

    $('.messages').remove();

    account.password = $(form)
      .find('input[name="account[password]"]')
      .val();
    account.password_confirmation = $(form)
      .find('input[name="account[password-confirmation]"]')
      .val();

    spire.accounts.update(account, function(err, updatedAccount){
      if (err) {
        $(form).spin({ stop: true });

        var li = $('<li />').text(['There was a problem updating your'
            , 'password. Please make sure that your password and password'
            , 'confirmation match and try again.'].join(' '))
        ;

        app.flash('There was a problem updating your password :(');

        $(messages).append(li);
        $(form).append(messages);
      }

      updatedAccount.password = account.password;

      spire.accounts.authenticate(updatedAccount, function(err, session){
        if (err) {
          $(form).spin({ stop: true });
          throw err;
        }

        app.login(session, function(err, account){
          $(form).spin({ stop: true });

          if (err) throw err;

          app.redirect('/account/index.html', {
            notice: 'Your password has been successfully reset.'
          });
        });
      });
    });
  });

  makeTOC();
});


var makeTOC = function() {
  var list = $('ul.table-of-contents')
  ;

  // add the headings to the list
  $('.center').find('h1, h2, h3, h4, h5, h6').each(function() {
    var el = this
      , name = this.nodeName.toLowerCase()
      , li = $('<li>')
        .addClass(name)
      , a = $('<a />')
        .text($(el).text())
      , anchor = name
        + '-'
        + Math.ceil(Math.random()*100000)
    ;

    // jam the anchor into the page
    $(el).before($('<a />').attr({ 'id': anchor
    , 'class': 'toc'
    }));

    $(a).attr('href', '#' + anchor);

    $(list).append(li.append(a));

    $(a).click(function(event){
      var anchor = $('a' + $(this).attr('href'));
      ;

      $.scrollTo(anchor, 500, {
        offset: { top: -$('#scrolling').outerHeight() }
      });
    });

  });
};
