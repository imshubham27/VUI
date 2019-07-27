'use strict';

var no;
var https = require('https');
var dict = {};
var he = require('he');
var ssval = require('ssml-validator');
var name_arr = [];
var repeat = '';
var a;
var c = 0;
var b = 1;
var id;
var type;
var answers = [];
var results = [];
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
      repeat = options.speechText = "Think you can ace this quiz? In our world, General Knowledge is all about the fun stuff. Let's start . How many question do you want? ";
      options.repromptText = "How many questions do you want?";
      options.endSession = false;
      context.succeed(buildResponse(options));
    }

    else if (request.type === "IntentRequest") {
      if (request.intent.name === "RepeatIntent") {
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
        repeat = options.speechText = "Show the world how clever you are while you learn new fun and interesting facts.";
        options.endSession = false;
        context.succeed(buildResponse(options));
      }

      if (request.intent.name === "NoOfQuestionsShowingCategory") {
        let options = {};
        options.session = session;
        no = request.intent.slots.number.value;
        let str = '';
        return getCall().then((data) => {
          options.session.attributes.NoOfQuestions = true;
          no = request.intent.slots.number.value;
          console.log("DATA", data);
          a = 0;
          str += "Say like first or second to select a category . ";
          str += "Choose one category";
          while (a < data.trivia_categories.length) {
            dict[`${data.trivia_categories[a].name}`] = `${data.trivia_categories[a].id}`;
            name_arr[a] = data.trivia_categories[a].name;
            if (a < 3 && data.trivia_categories[a] !== undefined)
              str += `<say-as interpret-as="ordinal">${(a + 1)}</say-as>. ${name_arr[a]} . `;
            a++;
          }
          // console.log("STRING", str);
          // console.log("NAME ARRAY", name_arr);
          // console.log("DICT", dict);
          str = ssval.correct(str);
          options.speechText = str;
          repeat = str;
          a = 3;
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

      else if (request.intent.name === "AMAZON.YesIntent") {
        console.log("I AM IN YESINTENT");
        let options = {};
        options.session = session;
        if (session.attributes.ShowingMoreQuesYESNo) {
          options.session.attributes.BookingYESIntent = true;
          for (var i = 0; i < options.session.attributes.length; i++)
            delete options.session.attributes[i];
          b = 1;
          c = 0;
          repeat = "How many questions do you want?";
          options.speechText = "How many questions do you want?";
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
        else if (session.attributes.error) {
          repeat = "Welcome to Knowledge Quest . How many questions do you want?";
          options.speechText = "Welcome to Knowledge Quest . How many questions do you want?";
          for (var i = 0; i < options.session.attributes.length; i++)
            delete options.session.attributes[i];
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
        else {
          options.speechText = "Please give a correct response";
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
      }

      else if (request.intent.name === "AMAZON.NoIntent") {
        console.log("I AM IN NOINTENT");
        let options = {};
        options.session = session;
        if (session.attributes.ShowingMoreQuesYESNo) {
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


      else if (request.intent.name === "MoreIntent") {
        console.log("I AM IN MoreIntent");
        let options = {};
        options.session = session;
        if ((session.attributes.NoOfQuestions === true || session.attributes.Moreintent === true)) {
          options.session.attributes.Moreintent = true;
          let str = '';
          global.count = a + 3;
          if (name_arr[a] === undefined) {
            repeat = "Sorry , No more Categories are there";
            options.speechText = "Sorry , No more Categories are there";
          }
          else {
            str += "Categories are . ";
            console.log("I AM IN GETCALL(RESPONSE)");
            while (a < global.count && name_arr[a] !== undefined) {
              str += `<say-as interpret-as="ordinal">${(a + 1)}</say-as>. ${name_arr[a]} . `;
              a++;
            }
            if (name_arr[a] !== undefined) {
              str += "Say more to listen to more categories";
            }
            str = ssval.correct(str);
            console.log("STR", str);
            options.speechText = str;
            repeat = str;
          }
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
        else {
          options.speechText = "please give a correct response";
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
      }

      else if (request.intent.name === "SelectingCategoryShowingDifficulty") {
        let options = {};
        options.session = session;
        console.log("SelectingCategory/ShowingDifficulty");
        let ordinal = request.intent.slots.ordinal.value;
        if ((session.attributes.NoOfQuestions === true || session.attributes.Moreintent === true)) {
          id = dict[name_arr[ordinal - 1]];
          console.log("ID", id);
          return getIDQues(id).then((data) => {
            if (no <= data.category_question_count.total_question_count) {
              delete options.session.attributes.NoOfQuestions;
              delete options.session.attributes.Moreintent;
              options.session.attributes.SelectingCategory = true;
              repeat = "Select Difficulty level : Easy, Medium, or Hard";
              options.speechText = "Select Difficulty level : Easy, Medium, or Hard";
            }
            else {
              repeat = `Sorry, we don't have that much questions in that category .  We have ${data.category_question_count.total_easy_question_count} in easy . ${data.category_question_count.total_easy_question_count} in medium . ${data.category_question_count.total_easy_question_count} in hard . Now, how many questions do you want`;
              options.speechText = `Sorry, we don't have that much questions in that category .  We have ${data.category_question_count.total_easy_question_count} in easy . ${data.category_question_count.total_easy_question_count} in medium . ${data.category_question_count.total_easy_question_count} in hard . Now, how many questions do you want`;
            }
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
        else if (session.attributes.ShowingQues === true || session.attributes.ShowingMoreQues === true) {
          options.session.attributes.ShowingMoreQues = true;
          delete options.session.attributes.ShowingQues;
          let str = '';
          if (b < no) {
            let a = 0;
            var numbers = [0, 1, 2, 3];
            var random = shuffle(numbers);
            console.log("B", b);
            console.log("RESULTS 2", results);
            if (answers[ordinal - 1] === results[b - 1].correct_answer) {
              var s = "That's a right answer . Next Question . ";
              c++;
            }

            else {
              var s = "That's a wrong answer . Correct answer is . " + results[b - 1].correct_answer + " . Next question . ";
            }
            while (a < 3) {
              answers[random[a]] = results[b].incorrect_answers[a];
              a++;
            }
            answers[random[3]] = results[b].correct_answer;
            str += results[b].question + " . ";
            console.log("ANSWERS", answers);
            a = 0;
            while (a < 4) {
              str += `<say-as interpret-as="ordinal">${(a + 1)}</say-as>. ${answers[a]} . `;
              a++;
            }
            b++;
            str = he.decode(str);
            str = ssval.correct(str);
            repeat = str;
            str = s + str;
            str = he.decode(str);
            str = ssval.correct(str);
            options.speechText = str;
          }
          else {
            options.session.attributes.ShowingMoreQuesYESNo = true;
            delete options.session.attributes.ShowingMoreQues;
            if (answers[ordinal - 1] === results[b - 1].correct_answer) {
              var k = "That's a right answer . ";
              c++;
            }
            else {
              var k = "That's a wrong answer . ";
              k += "Correct answer is . " + results[b - 1].correct_answer;
            }
            str = ` . Well played . Your score is ${c} out of ${no} . Do you want to play another session ?`;
            repeat=str;
            str=k+str
            options.speechText =str;
          }
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
        else {
          options.speechText = "please give a correct response";
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
      }

      else if (request.intent.name === "SelectingDifficultyShowingQuestions") {
        let options = {};
        options.session = session;
        type = request.intent.slots.Type.value;
        console.log("TYPE", type);
        console.log("I AM IN SelectingDifficulty/ShowingQuestions");
        if (session.attributes.SelectingCategory === true) {
          let a = 0;
          let str = '';
          return getQues().then((data) => {
            options.session.attributes.ShowingQues = true;
            delete options.session.attributes.SelectingCategory;
            results = data;
            console.log("RESULTS", results);
            var numbers = [0, 1, 2, 3];
            var random = shuffle(numbers);
            while (a < 3) {
              answers[random[a]] = data[0].incorrect_answers[a];
              a++;
            }
            answers[random[3]] = data[0].correct_answer;
            str += "Say like first or second to select an option ";
            str += "Here's your first question . ";
            str += data[0].question;
            console.log("ANSWERS", answers);
            a = 0;
            while (a < 4) {
              str += `<say-as interpret-as="ordinal">${(a + 1)}</say-as>. ${answers[a]} . `;
              a++;
            }
            str = he.decode(str);
            str = ssval.correct(str);
            options.speechText = str;
            repeat=str;
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
        else {
          options.speechText = "please give a correct response";
          options.endSession = false;
          context.succeed(buildResponse(options));
        }
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

const getCall = () => {
  console.log("I AM IN GETCALL");
  return new Promise((resolve, reject) => {
    let req = https.get(`https://opentdb.com/api_category.php`, (res) => {
      let data = '';
      let newData;
      res.on('data', function (chunk) {
        data += chunk.toString();
      });
      res.on('end', function () {
        newData = JSON.parse(data);
        // console.log(newData);
        return resolve(newData);
      });
    });
    req.on('error', function (err) {
      reject(err);
    });
  });
};

const getIDQues = (id) => {
  console.log("I AM IN getQues");
  return new Promise((resolve, reject) => {
    let req = https.get(`https://opentdb.com/api_count.php?category=${id}`, (res) => {
      let data = '';
      let newData;
      res.on('data', function (chunk) {
        data += chunk.toString();
      });
      res.on('end', function () {
        newData = JSON.parse(data);
        // console.log(newData);
        return resolve(newData);
      });
    });
    req.on('error', function (err) {
      reject(err);
    });
  });
};

function shuffle(o) {
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

const getQues = () => {
  console.log("I AM IN GETQues");
  // console.log("NO",no);
  // console.log("ID",id);
  // console.log("TYPE",type);
  return new Promise((resolve, reject) => {
    let req = https.get(`https://opentdb.com/api.php?amount=${no}&category=${id}&difficulty=${type}&type=multiple`, (res) => {
      let data = '';
      let newData;
      res.on('data', function (chunk) {
        data += chunk.toString();
        // console.log(data);
      });
      res.on('end', function () {
        newData = JSON.parse(data);
        // console.log(newData);
        return newData.response_code === 0 ? resolve(newData.results) : reject(newData.response_code);
      });
    });
    req.on('error', function (err) {
      reject(err.message);
    });
  });
};