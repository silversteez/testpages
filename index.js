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
  $("#find-game").click(function(e) {
    $('#loading').show();
//    playerQueueRef.startAt().limit(1).once("value", function(snapshot){
//      console.log("opponent is", snapshot.val());
//      if (!snapshot.val()) {
//        console.log("no opponents available");
//      } else {
//        snapshot.ref().transaction(function(curData){
//          myOpponentId = curData.val();
//          curData.remove();
//          return;
//        }, function(error, committed, snapshot) {
//          alert(error);
//          alert(committed);
//          alert(snapshot.val());
//        });
//      }
//    });
    playerQueueRef.startAt().limit(1).once("value", function(snapshot) {
      snapshot.forEach(function(opponent) {
//        myOpponentId = opponent.val();
//        opponent.ref().remove(function(error){
//          if (error) {
//            console.log(error);
//          }
//        });

        opponent.ref().transaction(function(curValue){
          if(curValue){
            myOpponentId = curValue.uid;
            return null; // Doesn't result in an error if it's already been nulled by another user
          }
        }, function(error, committed, snapshot){
          console.log(error, committed, snapshot.val());
        });
      });
    });

//    playerQueueRef.once("value", function(playerQueue){
//      console.log("playerQueue is", playerQueue.val());
////      playerQueue.startAt().limit(1).once("value", function(snapshot) {
////
////      });
//    });
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
