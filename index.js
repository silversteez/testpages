$(function() {

  var myRootRef = new Firebase('https://resplendent-fire-5710.firebaseio.com/');
  var myBlurbsRef = myRootRef.child('blurbs');
  console.log('its working', myRootRef);

  var $list = $('#my-list');

  myBlurbsRef.on('child_added', function(snapshot) {
    var $li = $('<li>');
    console.log(snapshot.val());
    $li.text(snapshot.val().blurb);
    $list.append($li);
  });

  $("#my-input").keypress(function (e) {
    if (e.keyCode == 13) {
      var blurb = $(this).val();
      myBlurbsRef.push({blurb:blurb});
      $(this).val('');
    }
  });

});
