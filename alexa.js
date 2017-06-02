"use strict";

module.exports = (req, res) => {

    let session = req.body.session,
        intent,
        dialogState,
        slots;
    session.attributes = session.attributes || {};
    
    if(req.body.request.dialogState){
         dialogState = req.body.request.dialogState;
    }
    
    if (req.body.request.intent) {
        intent = req.body.request.intent.name;
        slots = req.body.request.intent.slots;
    }

    let say = (text, shouldEndSession) => {
        let outputSpeech = {};

        if (text.indexOf("/>") > 0 || text.indexOf("</")) {
            outputSpeech.type = 'SSML';
            outputSpeech.ssml = "<speak>" + text + "</speak>";
        } else {
            outputSpeech.type = 'PlainText';
            outputSpeech.text = text;
        }

        res.json({
            version: req.version,
            sessionAttributes: session.attributes,
            response: {
                outputSpeech: outputSpeech,
                shouldEndSession: shouldEndSession
            }
        });

    };
    let direct = (text,shouldEndSession) => {
        console.log('In Direct');
        let outputSpeech = {};

        if (text.indexOf("/>") > 0 || text.indexOf("</")) {
            outputSpeech.type = 'SSML';
            outputSpeech.ssml = "<speak>" + text + "</speak>";
        } else {
            outputSpeech.type = 'PlainText';
            outputSpeech.text = text;
        }
        res.json({
            version: req.version,
            sessionAttributes: session.attributes,
            response: {
                shouldEndSession: shouldEndSession
            },
            "directives": [{
                "type": "Dialog.Delegate"
            }]
        });

    };

    return {

        type: req.body.request.type,

        intent: intent,

        slots: slots,
        
        dialogState: dialogState,

        session: session,
        response: {
            say: text => say(text, true),
            ask: text => say(text, false),
            direct: text => direct(text,false)
        }

    };

};
