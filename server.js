"use strict";

let express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('./alexa'),
    handlers = require('./handlers'),
    app = express(),
    alexaVerifier = require('alexa-verifier');

function requestVerifier(req, res, next) {
    alexaVerifier(
        req.headers.signaturecertchainurl,
        req.headers.signature,
        req.rawBody,
        function verificationCallback(err) {
            if (err) {
                res.status(401).json({ message: 'Verification Failure', error: err });
            } else {
                next();
            }
        }
    );
}

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json({
    verify: function getRawBody(req, res, buf) {
        req.rawBody = buf.toString();
    }
}));

app.post('/dreamhouse',requestVerifier, (req, res) => {

    let alx = alexa(req, res),
        type = alx.type,
        intent = alx.intent,
        slots = alx.slots,
        session = alx.session,
        response = alx.response;
    console.log('Logging request'+ type + ' ' + intent + ' ' + session);
    if (type === 'LaunchRequest') {
        
        response.ask("Welcome to Cumulus Mortgage Demo. What would you like to know?","false");
    } else if (type === 'SessionEndedRequest') {
        // Per the documentation, we do NOT send ANY response... I know, awkward.
        console.log('Session ended', req.body.request.reason);
    }else if (type === 'IntentRequest') {
        if(intent==='AMAZON.HelpIntent'){
            response.ask("Sure, you can ask me questions like Alexa ask Cumulus mortgage for what is for sale.");
        }else if(intent==='AMAZON.CancelIntent'){
            response.say("Consider it done!");
        }else if(intent==='AMAZON.StopIntent'){
            response.say("Consider it done!");
        }else{
            let handler = handlers[intent];
            if (handler) {
                handler(slots, session, response);
            } else {
                response.say("I don't know how to answer that");
            }
        }
    } else {
        response.say("Not sure what you mean");
    }

});

app.listen(app.get('port'), function() {
    console.log("Cumulus Alexa server listening on port " + app.get('port'));
});
