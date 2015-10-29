var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!
var urlParser = require('url');
var utils = require('./http-helpers');

var actions = {
  'GET': function (request, response) {
    var parts = urlParser.parse(request.url);
    var urlPath = parts.pathname === '/' ? '/index.html' : parts.pathname;

    utils.serveAssets(response, urlPath, function () {
      // is it in sites.txt?
      archive.isUrlInList(urlPath.slice(1), function (found) {
        if (found) { // if yes -> loading
          utils.sendRedirect(response, '/loading.html');
        } else { // if no -> 404
          utils.send404(response);
        }
      });
    });
    //response.end(archive.paths.list);
  },
  'POST': function (request, response) {
    utils.collectData(request, function (data) {
      var url = data.split('=')[1];
      // in sites.txt?
      archive.isUrlInList(url, function (found) {
        if (found) { // if yes
          // is it archived?
          archive.isUrlArchived(url, function (exists) {
            if (exists) { // if yes
              // display page
              utils.sendRedirect(response, '/' + url);
            } else { // if no
              // redirect loading
              utils.sendRedirect(response, '/loading.html');
            }
          });
        } else { // if no
          // append to sites.txt
          archive.addUrlToList(url, function () {
            // redirect loading
            utils.sendRedirect(response, '/loading.html');
          });
        }
      });
    });
  }
};

exports.handleRequest = function (request, response) {
  var action = actions[request.method];
  if (action) {
    action(request, response)
  } else {
    utils.sendResponse(response, "Not Found", 404);
  }
};