"use strict";

let salesforce = require("./salesforce");

exports.SearchProducts = (slots, session, response)  => {
    session.attributes.stage = "ask_ratetype";
    let text = 'OK, which of these rates types do you want the rates for';
    salesforce.findAllRateTypes().then(rateTypes => {
        rateTypes.forEach(product => {
            console.log(product);
            let productType = product.get("Product_Type__c");
            text +='<break time="0.5s" />' + productType ;
            console.log(text);
        });
        console.log('FINAL' + text);
        response.ask(text);
    });
};
exports.SearchRateType = (slots, session, response) => {
    session.attributes.rateType = slots.RateType.value;
    console.log('Looking for rates of type:' + session.attributes.rateType);
    let text = 'OK, the different rates for ${session.attributes.city} are as follows ';
    salesforce.findRate(session.attributes.rateType).then(products => {
        if(products && products.length>0){
            products.forEach(product => {
                text+= `For <break time="0.5s" />${product.get("Product_Name__c")} the rate is ${product.get("rate__c")}%  and the APR is ${product.get("apr__c")}%`;
            });
            response.say(text);
        }else{
            response.say(`Sorry, I didn't find any rates for type ${session.attributes.rateType} `);
        }
    })
    .catch((err) => {
        console.error(err);
        response.say("Oops. Something went wrong");
    });
};

exports.SearchHouses = (slots, session, response) => {
    session.attributes.stage = "ask_city";
    response.ask("OK, in what city?");
};

exports.AnswerCity = (slots, session, response) => {
    if (session.attributes.stage === "ask_city") {
        session.attributes.city = slots.City.value;
        session.attributes.stage = "ask_bedrooms";
        response.ask("How many bedrooms?");
    } else {
        response.say("Sorry, I didn't understand that");
    }
};

exports.AnswerNumber = (slots, session, response) => {
    if (session.attributes.stage === "ask_bedrooms") {
        session.attributes.bedrooms = slots.NumericAnswer.value;
        session.attributes.stage = "ask_price";
        response.ask("Around what price?");
    } else if (session.attributes.stage === "ask_price") {
        let price = slots.NumericAnswer.value;
        session.attributes.price = price;
        let priceMin = price * 0.8;
        let priceMax = price * 1.2;
        salesforce.findProperties({city: session.attributes.city, bedrooms: session.attributes.bedrooms, priceMin: priceMin, priceMax: priceMax})
            .then(properties => {
                if (properties && properties.length>0) {
                    let text = `OK, here is what I found for ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around $${price}: `;
                    properties.forEach(property => {
                        text += `${property.get("Address__c")}, ${property.get("City__c")}: $${property.get("Price__c")}. <break time="0.5s" /> `;
                    });
                    response.say(text);
                } else {
                    response.say(`Sorry, I didn't find any ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around ${price}.`);
                }
            })
            .catch((err) => {
                console.error(err);
                response.say("Oops. Something went wrong");
            });
    } else {
        response.say("Sorry, I didn't understand that");
    }
};

exports.Changes = (slots, session, response) => {
    salesforce.findPriceChanges()
        .then(priceChanges => {
            let text = "OK, here are the recent price changes: ";
            priceChanges.forEach(priceChange => {
                    let property = priceChange.get("Parent");
                    text += `${property.Address__c}, ${property.City__c}.<break time="0.2s"/>
                            Price changed from $${priceChange.get("OldValue")==null?0:priceChange.get("OldValue")} to $${priceChange.get("NewValue")}.<break time="0.5s"/>`;
            });
           response.say(text);
        })
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};
