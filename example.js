// Generated by CoffeeScript 1.6.3
(function() {
  var WEBSITES, addItemListeners, cluster, main, phantomCluster;

  phantomCluster = require("./index");

  cluster = require("cluster");

  WEBSITES = {
    "http://www.themuse.com/": "The Muse - Career advice and better job search",
    "http://www.themuse.com/companies": "Companies | The Muse",
    "http://www.themuse.com/jobs": "Jobs | The Muse",
    "http://www.themuse.com/developers": "The Muse - Career advice and better job search"
  };

  addItemListeners = function(item) {
    item.on("timeout", function() {
      return console.log("# Queue item timed out, re-enqueueing " + item.id);
    });
    return item.on("response", function() {
      console.log("# Response");
      if (WEBSITES[item.request] !== item.response) {
        throw new Error("Unexpected response for " + item.request + ": " + item.response);
      }
    });
  };

  main = function() {
    var engine, i, key, _i;
    engine = phantomCluster.createQueued({
      workers: 4,
      workerIterations: 4,
      phantomBasePort: 90222
    });
    if (cluster.isMaster) {
      for (i = _i = 0; _i < 4; i = ++_i) {
        for (key in WEBSITES) {
          addItemListeners(engine.enqueue(key));
        }
      }
    }
    engine.on("workerStarted", function(worker) {
      return console.log("# Worker started: " + worker.id);
    });
    engine.on("workerDied", function(worker) {
      return console.log("# Worker died: " + worker.id);
    });
    engine.on("started", function() {
      return console.log("# Started");
    });
    engine.on("stopped", function() {
      return console.log("# Stopped");
    });
    engine.on("phantomStarted", function() {
      return console.log("# Phantom instance started");
    });
    engine.on("phantomDied", function() {
      return console.log("# Phantom instance died");
    });
    engine.on("queueItemReady", function(url) {
      var _this = this;
      return this.ph.createPage(function(page) {
        return page.open(url, function(status) {
          return page.evaluate((function() {
            return document.title;
          }), function(result) {
            console.log("# Finished request for " + url + ": " + result);
            return _this.queueItemResponse(result);
          });
        });
      });
    });
    return engine.start();
  };

  main();

}).call(this);
