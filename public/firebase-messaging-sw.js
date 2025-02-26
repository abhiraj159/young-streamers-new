if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(function (registration) {
      console.log("Service Worker registered with scope: ", registration.scope);
    })
    .catch(function (error) {
      console.log("Service Worker registration failed: ", error);
    });
}
