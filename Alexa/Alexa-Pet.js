'use strict';

var no;
var https = require('https');
var type;
var repeat;
var he = require('he');
var ssval = require('ssml-validator');
var fall_answers = [
    "I didn't get that. Can you say it again?", "I missed what you said. What was that?", "Sorry, could you say that again?", "Sorry, can you say that again?", "Can you say that again?", "Sorry, I didn't get that. Can you rephrase?", "Sorry, what was that?", "One more time?", "What was that?", "Say that one more time?", "I didn't get that. Can you repeat?", "I missed that, say that again?"
];

exports.handler = function (event, context) {
    try {
        var request = event.request;
        var session = event.session;
        require('events').EventEmitter.defaultMaxListeners = 100;
        if (!event.session.attributes) {
            event.session.attributes = {};
        }

        if (request.type === "LaunchRequest") {//REQUEST TYPE
            let options = {};//
            console.log("I AM IN LAUNCH REQUEST INTENT");
            repeat = options.speechText = "Want to learn more about your furry friends . We have got some facts you may not know! . You want to know listen facts about dogs or cats? ";
            options.repromptText = "You want to know listen facts about dogs or cats?";
            options.endSession = false;
            context.succeed(buildResponse(options));
        }

        else if (request.type === "IntentRequest") {
            if (request.intent.name === "AMAZON.RepeatIntent") {
                let options = {};
                options.session = session;
                console.log("I AM IN REPEATINTENT");
                options.speechText = repeat;
                options.endSession = false;
                context.succeed(buildResponse(options));
            }
            else if (request.intent.name === "AMAZON.StopIntent") {
                let options = {};
                options.session = session;
                console.log("I AM IN ASK SCHEDULE INTENT");
                options.speechText = "Good bye . have a nice day";
                delete options.session.attributes;
                options.endSession = true;
                context.succeed(buildResponse(options));
            }

            else if (request.intent.name === "AMAZON.FallbackIntent") {
                let options = {};
                options.session = session;
                console.log("I AM IN Fallback INTENT");
                var item = fall_answers[Math.floor(Math.random() * fall_answers.length)];
                repeat = options.speechText = item;
                options.endSession = false;
                context.succeed(buildResponse(options));
            }

            else if (request.intent.name === "AMAZON.HelpIntent") {
                let options = {};
                options.session = session;
                console.log("I AM IN Help INTENT");
                repeat = options.speechText = "We say you facts about cats and dogs";
                options.endSession = false;
                context.succeed(buildResponse(options));
            }

            else if (request.intent.name === "PetFact") {
                let options = {};
                options.session = session;
                options.session.attributes.Petfact = true;
                let a;
                a = request.intent.slots.type.value;
                if(a=="cat facts"||a=="cat"||a=="a cat fact"||a=="a cat"||a=="cat fact"||a=="cats")
                type="cats";
                if(a=="dog facts"||a=="dog"||a=="a dog fact"||a=="a dog"||a=="dog fact"||a=="dogs")
                type="dogs";
                repeat = options.speechText = `How many facts about ${type} do you want to listen?`;
                options.endSession = false;
                context.succeed(buildResponse(options));
            }

            else if (request.intent.name === "Gettingnumber") {
                let options = {};
                options.session = session;
                no = request.intent.slots.number.value;
                if (session.attributes.Petfact) {
                    let str = '';
                    var c = 0;
                    if (type == "dogs") {
                        return getDogFact().then((data) => {
                            options.session.attributes.GetNo = true;
                            delete options.session.attributes.Petfact;
                            console.log("Data", data);
                            while (c < no) {
                                str += `<say-as interpret-as="ordinal">${(c + 1)}</say-as> . ${data[c]} . `;
                                c++;
                            }
                            str += "Would you like to listen more facts?";
                            str = he.decode(str);
                            str = ssval.correct(str);
                            repeat = options.speechText = str;
                            options.endSession = false;
                            context.succeed(buildResponse(options));
                        }).catch((error) => {
                            repeat = options.speechText = 'Sorry, an error has occurred . Do you want to cancel this wave and start a new session';
                            options.session.attributes.error = true;
                            console.log("----ERROR----", error);
                            options.endSession = false;
                            context.succeed(buildResponse(options));
                        });
                    }
                    if (type == "cats") {
                        return getCatFact().then((data) => {
                            options.session.attributes.GetNo = true;
                            delete options.session.attributes.Petfact;
                            console.log("Data", data);
                            while (c < no) {
                                str += `<say-as interpret-as="ordinal">${(c + 1)}</say-as> . ${data[c].fact} . `;
                                c++;
                            }
                            str += "Would you like to listen to more facts?";
                            str = he.decode(str);
                            str = ssval.correct(str);
                            repeat = options.speechText = str;
                            options.endSession = false;
                            context.succeed(buildResponse(options));
                        }).catch((error) => {
                            repeat = options.speechText = 'Sorry, an error has occurred . Do you want to cancel this wave and start a new session';
                            options.session.attributes.error = true;
                            console.log("----ERROR----", error);
                            options.endSession = false;
                            context.succeed(buildResponse(options));
                        });
                    }
                }
                else {
                    options.speechText = "please give a correct response";
                    options.endSession = false;
                    context.succeed(buildResponse(options));
                }
            }

            else if (request.intent.name === "AMAZON.YesIntent") {
                console.log("I AM IN YESINTENT");
                let options = {};
                options.session = session;
                if (session.attributes.GetNo) {
                    repeat = options.speechText = "You want to know listen facts about dogs or cats? ";
                    options.repromptText = "You want to know listen facts about dogs or cats? ";
                    options.endSession = false;
                    context.succeed(buildResponse(options));
                }
                else if (session.attributes.error) {
                    repeat = "You want to know listen facts about dogs or cats? ";
                    options.speechText = "You want to know listen facts about dogs or cats? ";
                    for (var i = 0; i < options.session.attributes.length; i++)
                      delete options.session.attributes[i];
                    options.endSession = false;
                    context.succeed(buildResponse(options));
                  }
                else {
                    options.speechText = "please give a correct response";
                    options.endSession = false;
                    context.succeed(buildResponse(options));
                }
            }

            else if (request.intent.name === "AMAZON.NoIntent") {
                console.log("I AM IN NOINTENT");
                let options = {};
                options.session = session;
                if (session.attributes.GetNo) {
                    for (var i = 0; i < options.session.attributes.length; i++)
                        delete options.session.attributes[i];
                    repeat = options.speechText = "Good bye . have a nice day";
                    options.endSession = true;
                    context.succeed(buildResponse(options));
                }
                else {
                    options.speechText = "Please give a correct response";
                    options.endSession = false;
                    context.succeed(buildResponse(options));
                }
            }
            else if (request.intent.name === "RepeatIntent") {
                let options = {};
                options.session = session;
                options.speechText = repeat;
                options.endSession = false;
                context.succeed(buildResponse(options));
            }
        }
        else if (request.type === "SessionEndRequest") {
            let options = {};
            options.session = session;
            repeat = options.speechText = "Sorry . Your response doesn't matches with any of our requests";
            options.endSession = false;
            context.succeed(buildResponse(options));
            // throw ("Unknown intent type");
        }
        else {
            let options = {};
            options.session = session;
            repeat = options.speechText = "Sorry . Your response doesn't matches with any of our requests";
            options.endSession = false;
            context.succeed(buildResponse(options));
            throw ("Unknown intent type");
        }
    }

    catch (e) {
        let options = {};
        options.session = session;
        context.fail("Exception: " + e);
        repeat = options.speechText = "Sorry I didn't get you . Can you please repeat that up for me";
        options.endSession = false;
        context.succeed(buildResponse(options));
    }
};

function buildResponse(options) {
    var response = {
        version: "1.0",
        response: {
            outputSpeech: {
                type: "SSML",
                "ssml": "<speak>" + options.speechText + "</speak>"
            },
            shouldEndSession: options.endSession
        }
    };

    if (options.repromptText) {
        response.response.reprompt = {
            outputSpeech: {
                type: "SSML",
                "ssml": "<speak>" + options.repromptText + "</speak>"
            }
        };
    }

    if (options.session && options.session.attributes) {
        response.sessionAttributes = options.session.attributes;
    }

    return response;
}



const getDogFact = () => {
    console.log("I AM IN GETDogFact");
    return new Promise((resolve, reject) => {
        let req = https.get(`https://dog-api.kinduff.com/api/facts?number=${no}`, (res) => {
            let data = '';
            let newData;
            res.on('data', function (chunk) {
                data += chunk.toString();
            });
            res.on('end', function () {
                newData = JSON.parse(data);
                // console.log(newData);
                return resolve(newData.facts);
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
    });
};

const getCatFact = () => {
    console.log("I AM IN GETCatFact");
    return new Promise((resolve, reject) => {
        let req = https.get(`https://catfact.ninja/facts?limit=${no}`, (res) => {
            let data = '';
            let newData;
            res.on('data', function (chunk) {
                data += chunk.toString();
            });
            res.on('end', function () {
                newData = JSON.parse(data);
                // console.log(newData);
                return resolve(newData.data);
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
    });
};



