"use strict";

let express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('./alexa'),
    handlers = require('./handlers'),
    app = express(),
    verifier = require('alexa-verifier');

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());

app.post('/dreamhouse', (req, res) => {

    let alx = alexa(req, res),
        type = alx.type,
        intent = alx.intent,
        slots = alx.slots,
        session = alx.session,
        response = alx.response;

    if (type === 'LaunchRequest') {
        response.say("Welcome to Cumulus Mortgage Demo");
    } else if (type === 'IntentRequest') {
        let handler = handlers[intent];
        if (handler) {
            handler(slots, session, response);
        } else {
            response.say("I don't know how to answer that");
        }
    } else {
        response.say("Not sure what you mean");
    }

});

app.listen(app.get('port'), function() {
    console.log("Cumulus Alexa server listening on port " + app.get('port'));
});
