// https://developer.mozilla.org/en-US/docs/Web/API/notification
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyMe() {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Reminder', {
      icon: 'images/tomato.jpg',
      body: "Hey there! You have finished a tomato, Pleaes have a rest",
	  requireInteraction : true,
    });

    notification.onclick = function () {
      window.open("http://stackoverflow.com/a/13328397/1269037");      
    };

  }

}