var myRootRef = new Firebase('https://resplendent-fire-5710.firebaseio.com/');
myRootRef.set('Hello World!');
console.log('its working', myRootRef);