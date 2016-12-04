var Router = require("vertx-web-js/router");
var SockJSHandler = require("vertx-web-js/sock_js_handler");
var StaticHandler = require("vertx-web-js/static_handler");

var router = Router.router(vertx);


var opts = {
  "inboundPermitteds" : [
    {
      "address" : "panic.from.patient"
    },
    {
      "address" : "confirmation.from.volunteer"
    }
  ],
  "outboundPermitteds" : [
    {
      "address" : "panic.to.volunteer"
    },
    {
      "address" : "confirmation.to.patient"
    }
  ]
};


var ebHandler = SockJSHandler.create(vertx).bridge(opts);
router.route("/eventbus/*").handler(ebHandler.handle);


router.route().handler(StaticHandler.create().handle);


vertx.createHttpServer().requestHandler(router.accept).listen(8080);

var eb = vertx.eventBus();


eb.consumer("panic.from.patient").handler(function (message) {

  console.log("New panic signal recieved");
  eb.publish("panic.to.volunteer", message.body());
});

eb.consumer("confirmation.from.volunteer").handler(function (message) {

  var timestamp = Java.type("java.text.DateFormat").getDateTimeInstance(Java.type("java.text.DateFormat").SHORT, Java.type("java.text.DateFormat").MEDIUM).format(Java.type("java.util.Date").from(Java.type("java.time.Instant").now()));
  eb.publish("confirmation.to.patient", timestamp + ": " + message.body());
});

