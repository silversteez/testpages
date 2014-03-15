$(function() {
  var userId;
  var userDataRef;

  var myRootRef = new Firebase('https://resplendent-fire-5710.firebaseio.com/');
  var myUsersRef = myRootRef.child('users');
  var playerQueueRef = myRootRef.child('playerQueue');

  var auth = new FirebaseSimpleLogin(myRootRef, function(error, user) {
    if (error) {
      console.log(error);
    } else if (user) {
      // user authenticated with Firebase
      console.log('full authenticated user:', user);

      userId = user.uid;
      userDataRef = myUsersRef.child(userId);
      userDataRef.update({uid:userId, type:user.provider + ' dude'});

      $guest = $('<p>').text(user.provider +": " + userId);
      $('body').prepend($guest);
    } else {
      console.log('Not logged in.');
//      simpleLogin.login('anonymous');
    }
  });

  var myBlurbsRef = myRootRef.child('blurbs');

  var $list = $('#my-list');

  myBlurbsRef.on('child_added', function(snapshot) {
    var $li = $('<li>');
    $li.text(snapshot.val().blurb);
    $list.append($li);
  });

  $("#my-input").keypress(function(e) {
    if (e.keyCode == 13) {
      var blurb = $(this).val();
      myBlurbsRef.push({blurb:blurb});
      $(this).val('');
    }
  });


  var myOpponentId;
  var opponentRef;
  $("#find-game").click(function(e) {
    $('#loading').show();
    playerQueueRef.startAt().limit(1).once("value", function(snapshot) {
      if (!snapshot.val()) {
        // Queue empty
        console.log("Empty queue");
      }
      snapshot.forEach(function(opponent) {
        opponentRef = opponent.ref();
        opponentRef.transaction(function(curValue){
          // If opponent is not null & no one has already declared himself as opponent
          if(curValue && !curValue.opponent){
            myOpponentId = curValue.uid;
            curValue.opponent = userId; // Declare myself as their opponent
            return curValue;
          }
        }, function(error, committed, snapshot){
          if (error) {
            console.log(error);
          }
          if (committed) {
            // Start game between 2 players
            console.log("Match created between", snapshot.val());
            // Remove queued opponent from Queue and try to start match
            opponentRef.remove();
          } else {
            // No match found
            console.log("Failed to find a match");
          }
        });
      });
    });
  });


  $("#join-queue").click(function(e) {
    playerQueueRef.push({uid:userId}, function(error){
      if(!error){
        $('#in-queue').show();
        console.log('joined queue');
      }
    });

  });

  $("#my-data").keypress(function(e) {
    if (e.keyCode == 13) {
      var dataArr = $(this).val().split(' ');
      var dataObj = {};
      dataObj[dataArr[0]] = dataArr[1];
      userDataRef.update(dataObj);
      $(this).val('');
    }
  });

  $("#my-create-account").click(function(e) {
      var type = $('#login-type').val();
      var email = $('#my-email').val();
      var pw = $('#my-password').val();
      if (type === 'create') {
        auth.createUser(email, pw, onCreateOrLogin);
      } else {
        auth.login('password', {email: email, password: pw}, onCreateOrLogin);
      }
  });

  function onCreateOrLogin(error, user) {
    console.log('oncreateorlogin', error, user);
    if (!error) {
//      userId = user.id;
//      userDataRef = myUsersRef.child(userId);
//      userDataRef.set({id:userId, name:'NOT anonymous dude'});
    }
  }

});
