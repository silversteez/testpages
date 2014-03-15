$(function() {
  // Game states
  var states = {};
  states.IN_QUEUE = "IN_QUEUE";
  states.JOINING_GAME = "JOINING_GAME";
  states.CHILLING = "CHILLING";
  states.MY_TURN = "MY_TURN";
  states.OPPONENT_TURN = "OPPONENT_TURN";
  states.GAME_OVER = "GAME_OVER";

  var state = states.CHILLING;
  var userId;
  var myUserDataRef;
  var myCurGameRef;

  var rootRef = new Firebase('https://resplendent-fire-5710.firebaseio.com/');
  var usersRef = rootRef.child('users');
  var queueRef = rootRef.child('playerQueue');
  var gamesRef = rootRef.child('games');
//  var myQueueRef; // My position when I'm in queue

  var myHealth;
  var myAttack;

  var myOpponentId;
  var oppQueueRef;

  var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
    if (error) {
      console.log(error);
    } else if (user) {
      // user authenticated with Firebase
      console.log('full authenticated user:', user);

      userId = user.uid;
      myUserDataRef = usersRef.child(userId);
      myUserDataRef.update({uid:userId, type:user.provider + ' dude'});


      // Set up listener on curGame of myUserDataRef
      myUserDataRef.child('curGame').on('value', function(snapshot) {
        var myPossibleGameRef = snapshot.val();
        if (myPossibleGameRef) {
          console.log('I am in a game! Located at', myPossibleGameRef);
          myCurGameRef = myPossibleGameRef;

          // Verify contents of myPossibleGameRef... Necessary??
          gamesRef.child(myPossibleGameRef).once('value', function(snapshot){
            var snapVal = snapshot.val();
            if (snapVal) {
              console.log('Game found', snapVal);
            } else {
              console.log('Game not found.');
            }
          });
        } else {
          console.log('My curGame value is null.');
        }
      });

      $guest = $('<p>').text(user.provider +": " + userId);
      $('body').prepend($guest);
    } else {
      console.log('Not logged in.');
    }
  });




  $("#find-game").click(function(e) {
    $('#loading').show();
    queueRef.startAt().limit(1).once("value", function(snapshot) {
      if (!snapshot.val()) {
        // Queue empty
        joinQueue();
        console.log("Empty queue. joining queue.");
      } else {
        snapshot.forEach(function(opponent) {
          oppQueueRef = opponent.ref();
          oppQueueRef.transaction(function(curValue){
            // If opponent is not null & no one has already declared himself as opponent
            if(curValue && !curValue.opponent){
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
              oppQueueRef.remove();
              myOpponentId = snapshot.val().uid;
              createGame();
            } else {
              // Attempted to match, but failed
              joinQueue();
              console.log("Failed to find a match. Joining queue.");
            }
          });
        });
      }
    });
  });

  function joinQueue() {
    queueRef.push({uid:userId}, function(error){
      if(!error){
        $('#in-queue').show();
        console.log('joined queue');
      }
    });
  }

  function createGame() {
    console.log('Attempting to create game.');
    var gameObj = {p1: userId, p2: myOpponentId};
    var curGameRef = gamesRef.push(gameObj);
    var myCurGameName = curGameRef.name();

    myUserDataRef.update({curGame: myCurGameName}, function(error) {
      if (error) {
        console.log('Error updating my user data curGame.', error);
      }
    });

    usersRef.child(myOpponentId).update({curGame: myCurGameName}, function(error) {
      if (error) {
        console.log('Error updating opponent user data curGame.', error);
      }
    });
  }


  $("#my-create-account").click(function(e) {
      var type = $('#login-type').val();
      var email = $('#my-email').val();
      var pw = $('#my-password').val();
      if (type === 'create') {
        auth.createUser(email, pw, onCreateOrLogin);
      } else {
        auth.login('password', {email: email, password: pw, rememberMe: true}, onCreateOrLogin);
      }
  });

  function onCreateOrLogin(error, user) {
    console.log('oncreateorlogin', error, user);
  }

});



//  myBlurbsRef.on('child_added', function(snapshot) {
//    var $li = $('<li>');
//    $li.text(snapshot.val().blurb);
//    $list.append($li);
//  });

//  $("#my-input").keypress(function(e) {
//    if (e.keyCode == 13) {
//      var blurb = $(this).val();
//      myBlurbsRef.push({blurb:blurb});
//      $(this).val('');
//    }
//  });

//  $("#my-data").keypress(function(e) {
//    if (e.keyCode == 13) {
//      var dataArr = $(this).val().split(' ');
//      var dataObj = {};
//      dataObj[dataArr[0]] = dataArr[1];
//      userDataRef.update(dataObj);
//      $(this).val('');
//    }
//  });