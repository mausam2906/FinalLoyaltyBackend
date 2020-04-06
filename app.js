'use strict';
var swaggerUi=require('swagger-ui-express')
var swaggerDocument=require('./api/swagger/swagger.json')
var SwaggerExpress = require('swagger-express-mw');

var app = require('express')();
module.exports = app; // for testing

var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());
app.use(session({secret : "ANYTHING"}));



var config = {
  appRoot: __dirname // required config
};
// app.use('/api-docs',swaggerUi.server,swaggerUi.setup(swaggerDocument))
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port =  10010;
  app.listen(port);

  app.get('/api/session/:name/:value',function(req,res){
    var name = req.params.name;
    var value=req.params.value;
  
    req.session[name] = value;
    
  
    console.log(req.session);
    res.send(req.session);
  })

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});


