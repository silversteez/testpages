$(function() {

  var myRootRef = new Firebase('https://resplendent-fire-5710.firebaseio.com/');
  var simpleLogin = new FirebaseSimpleLogin(myRootRef, function(error, user) {
    if (error) {
      console.log(error);
    } else if (user) {
      // user authenticated with Firebase
      console.log('full user:', user);
      console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
//      myRootRef.set(user.id, 'Anonymous' + user.id.substr(0,8));
    } else {
      console.log('Log in new guest.');
      simpleLogin.login('anonymous');
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

});
