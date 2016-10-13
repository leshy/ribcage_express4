(function(){
  var backbone, http, express, ejslocals, h, _, util, colors;
  backbone = require('backbone4000');
  http = require('http');
  express = require('express');
  ejslocals = require('ejs-locals');
  h = require('helpers');
  _ = require('underscore');
  util = require('util');
  colors = require('colors');
  exports.lego = backbone.Model.extend4000({
    requires: ['logger'],
    after: ['db'],
    init: function(callback){
      var app, this$ = this;
      this.env.app = app = express();
      this.settings = _.extend({
        'static': h.path(this.env.root, 'static'),
        views: h.path(this.env.root, 'ejs'),
        port: 80,
        log: true
      }, this.settings);
      if (this.settings.log) {
        app.use(function(req, res, next){
          var host, forwarded;
          host = req.socket.remoteAddress;
          if (host === "127.0.0.1") {
            if (forwarded = req.headers['x-forwarded-for']) {
              host = forwarded;
            }
          }
          req.logContext = {
            tags: ['ip-' + host]
          };
          this$.env.log(req.originalUrl + " [" + req.headers['user-agent'] + "]", {
            url: req.originalUrl,
            ip: host,
            headers: req.headers,
            method: req.method
          }, 'http', req.method, "ip-" + host);
          return next();
        });
      }
      if (this.settings.configure) {
        this.settings.configure(app);
      } else {
        app.engine('ejs', ejslocals);
        app.set('view engine', 'ejs');
        app.set('views', this.settings.views);
        app.set('x-powered-by', false);
        app.use(express['static'](this.settings['static'], {
          index: false,
          redirect: false,
          etag: false,
          dotfiles: 'ignore'
        }));
      }
      this.env.http = http.createServer(this.env.app);
      this.env.http.listen(this.settings.port);
      this.env.log('express listening at ' + colors.green(this.settings.port), {}, 'init', 'ok');
      return callback();
    }
  });
}).call(this);
