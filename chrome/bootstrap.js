console.log('NAAB activated');

setTimeout(function() {
  var script = document.createElement('script');
  script.src = chrome.extension.getURL('js/naab.js');
  (document.head||document.documentElement).appendChild(script);

  script = document.createElement('script');
  script.src = chrome.extension.getURL('js/init.js');
  (document.head||document.documentElement).appendChild(script);

  var link = document.createElement('link');
  link.href = chrome.extension.getURL('css/naab.css');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  (document.head||document.documentElement).appendChild(link);

  console.log('NAAB loaded');
}, 1000);
