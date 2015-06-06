function saveOptions() {
  chrome.storage.sync.set({
    mode: document.getElementById('mode').value,
    urls: {
      live: document.getElementById('liveUrl').value,
      dev: document.getElementById('devUrl').value
    }
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get({
    mode: 'live',
    liveUrl: 'https://s3-eu-west-1.amazonaws.com/naab.idleplaythings.com',
    devUrl: 'http://127.0.0.1:8000'
  }, function(options) {
    document.getElementById('mode').value = options.mode;
    document.getElementById('liveUrl').value = options.liveUrl;
    document.getElementById('devUrl').value = options.devUrl;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
