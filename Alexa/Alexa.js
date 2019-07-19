'use strict';

var no;
var https = require('https');
var dict = {};
var he = require('he');
var ssval= require('ssml-validator');
var name_arr = [];
var repeat = '';
var a;
var c = 0;
var b = 1;
var id;
var type;
var answers = [];
var results = [];
var fall_answers= [
    "I didn't get that. Can you say it again?","I missed what you said. What was that?","Sorry, could you say that again?","Sorry, can you say that again?","Can you say that again?","Sorry, I didn't get that. Can you rephrase?","Sorry, what was that?","One more time?","What was that?","Say that one more time?","I didn't get that. Can you repeat?","I missed that, say that again?"
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
            repeat=options.speechText = "Think you can ace this quiz? In our world, General Knowledge is all about the fun stuff. Let's start . How many question do you want? ";
            options.repromptText = "How many questions do you want?";
            options.endSession = false;
            context.succeed(buildResponse(options));
        }

        else if (request.type === "IntentRequest") {
            if(request.intent.name === "AMAZON.RepeatIntent"){
            let options={};
            options.session=session;
            console.log("I AM IN REPEATINTENT");
            options.speechText=repeat;
            options.endSession = false;
            context.succeed(buildResponse(options));
        }
            if (request.intent.name === "AMAZON.StopIntent") {
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
            var item = fall_answers[Math.floor(Math.random()*fall_answers.length)];
            repeat=options.speechText = item;
            options.endSession = false;
            context.succeed(buildResponse(options));
        }

        else if (request.intent.name === "AMAZON.HelpIntent") {
            let options = {};
            options.session = session;
            console.log("I AM IN Help INTENT");
            repeat=options.speechText = "Show the world how clever you are while you learn new fun and interesting facts.";
            options.endSession = false;
            context.succeed(buildResponse(options));
        }
        