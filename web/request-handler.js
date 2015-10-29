var path = require('path');
var archive = require('../helpers/archive-helpers');
// require more modules/folders here!
var urlParser = require('url');
var utils = require('./http-helpers');

var actions = {

  // solution branch
  //  var getSite = function(request, response){
  //    var urlPath = url.parse(request.url).pathname;
  //    // / means index.html
  //    if (urlPath === '/') { urlPath = '/index.html'; }
  //    helpers.serveAssets(response, urlPath, function() {
  //      // trim leading slash if present
  //      if (urlPath[0] === '/') { urlPath = urlPath.slice(1)}
  //      archive.isUrlInList(urlPath, function(found){
  //        if (found) {
  //          helpers.sendRedirect(response, '/loading.html');
  //        } else {
  //          helpers.send404(response);
  //        }
  //      });
  //    });
  //  };

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
  },

  //  solution branch
  //  var saveSite = function(request, response){
  //    helpers.collectData(request, function(data) {
  //      var url = JSON.parse(data).url.replace('http://', '');
  //      // check sites.txt for web site
  //      archive.isUrlInList(url, function(found){
  //        if (found) { // found site
  //          // check if site is on disk
  //          archive.isUrlArchived(url, function(exists) {
  //            if (exists) {
  //              // redirect to site page (/www.google.com)
  //              helpers.sendRedirect(response, '/' + url);
  //            } else {
  //              // Redirect to loading.html
  //              helpers.sendRedirect(response, '/loading.html');
  //            }
  //          });
  //        } else { // not found
  //          // add to sites.txt
  //          archive.addUrlToList(url, function(){
  //            // Redirect to loading.html
  //            helpers.sendRedirect(response, '/loading.html');
  //          });
  //        }
  //      });
  //    });
  //  };

  'POST': function (request, response) {
    utils.collectData(request, function (data) {
      //var url = data.split('=')[1];
      var url = JSON.parse(data).url.replace('http://', '');
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

// use this pattern to differentiate between archives, static assets, and errors
exports.handleRequest = function (request, response) {
  var action = actions[request.method];
  if (action) {
    action(request, response)
  } else {
    utils.sendResponse(response, "Not Found", 404);
  }
};