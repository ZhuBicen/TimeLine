// https://developer.mozilla.org/en-US/docs/Web/API/notification
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyRest() {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Reminder', {
      icon: 'images/tomato.jpg',
      body: "You have just finished a tomato, Let's have a rest",
	  requireInteraction : true,
    });
	setTimeout(function(){
	    notification.close();
		notifyWork();
	}, 1 * 60 * 1000);  // 5 minues rest

    notification.onclick = function () {
      window.open("http://stackoverflow.com/a/13328397/1269037");      
    };

  }
}

function notifyWork() {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Reminder', {
      icon: 'images/gree_tomato.jpg',
      body: "Hey there! Please start a new tomato",
	  requireInteraction : true,
    });

    notification.onclick = function () {
	  window.focus();
	  //this.cancel();
      // window.open("http://localhost:3000/TimeChart.html");      
	  notification.close();
    };

  }

}