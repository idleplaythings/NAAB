console.log('NAAB activated');

chrome.storage.sync.get({
  mode: 'live',
  liveUrl: 'https://s3-eu-west-1.amazonaws.com/naab.idleplaythings.com',
  devUrl: 'http://127.0.0.1:8000'
}, function(options) {
  var BASE_URL, RELEASE_URL, CSS_URL, JS_URL;

  if (options.mode === 'live') {
    BASE_URL = options.liveUrl;
    RELEASE_URL = BASE_URL + '/RELEASE';
    CSS_URL = BASE_URL + '/releases/%1/src/css/naab.css';
    JS_URL = BASE_URL + '/releases/%1/src/js/naab.js';
  } else {
    BASE_URL = options.devUrl;
    RELEASE_URL = BASE_URL + '/RELEASE';
    CSS_URL = BASE_URL + '/src/css/naab.css';
    JS_URL = BASE_URL + '/src/js/naab.js';
  }

  /**
   * The bootstrap script runs in an execution environment separate from the actual browser window,
   * so Moo Tools etc. aren't available here. Hence the oldskool approach.
   *
   * The actual NAAB scripts are served from Amazon S3.
   *
   * First request to the RELEASE file determines which version of NAAB should be injected. This approach
   * makes it very easy and fast to deploy changes (read: fixes) to NAAB, and to also control the current
   * version in case it needs to be rolled back and forth.
   */
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4 || xhr.status != 200) {
      return;
    }

    var release = xhr.responseText;
    var manifest = chrome.runtime.getManifest();

    document.documentElement.setAttribute('naab-extension-version', manifest.version);
    document.documentElement.setAttribute('naab-release', release);

    addCss(formatString(CSS_URL, [release]));
    addScript(formatString(JS_URL, [release]), function() {
      // Again, this execution context is separate from the one actually used by the ARMY5 frame,
      // so NAAB initialisation must happen via a script that's injected to the actual page.
      addScript(chrome.extension.getURL('init.js'));
    });
  }
  xhr.open('GET', RELEASE_URL, true);
  xhr.send();
})

function formatString(string, replacements) {
  return string.replace(/(%\d+)/g, substitute(replacements));
};

function substitute(substitutions) {
  if (typeof substitutions === 'undefined' || !substitutions) {
    substitutions = [];
  }

  return function(match) {
    return substitutions[parseInt(match.substr(1) - 1, 10)];
  };
};

function addCss(href) {
  var link = document.createElement('link');
  document.documentElement.appendChild(link);
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = href;
}

function addScript(src, onload) {
  var script = document.createElement('script');
  document.head.appendChild(script);

  if (onload) {
    script.onload = onload;
  }

  script.src = src;
}
