backbone = require 'backbone4000'
http = require 'http'
express = require 'express'
ejslocals = require 'ejs-locals'
h = require 'helpers'
_ = require 'underscore'
util = require 'util'
colors = require 'colors'

exports.lego = backbone.Model.extend4000 do
    requires: [ 'logger' ]
    after: [ 'db' ]
    init: (callback) ->
        @env.app = app = express()
        @settings = _.extend {
            static: h.path(@env.root, 'static')
            views: h.path(@env.root, 'ejs')
            port: 80
            log: true
        }, @settings

        if @settings.log
            app.use (req, res, next) ~>
                host = req.socket.remoteAddress
                if host is "127.0.0.1" then if forwarded = req.headers['x-forwarded-for'] then host = forwarded
                req.logContext = { tags: [ 'ip-' + host ] }
                @env.log req.originalUrl + " [" + req.headers['user-agent'] + "]", { url: req.originalUrl, ip: host, headers: req.headers, method: req.method }, 'http', req.method, "ip-" + host

                next()

        if @settings.configure then @settings.configure app
        else
            app.engine 'ejs', ejslocals
            app.set 'view engine', 'ejs'
            app.set 'views', @env?settings?module?express4?views or (__dirname + '/ejs')
            app.set 'x-powered-by', false
            app.use express.static (@env?settings?module?express4?static or (__dirname + '/static')), do
                index: false
                redirect: false
                etag: false
                dotfiles: 'ignore'


        @env.http = http.createServer @env.app
        @env.http.listen @settings.port
        @env.log 'express listening at ' + colors.green(@settings.port), {}, 'init','ok'

        callback()
