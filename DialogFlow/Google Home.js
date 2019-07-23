'use strict';

const { dialogflow } = require('actions-on-google');

const functions = require('firebase-functions');

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

const app = dialogflow({ debug: true });

app.intent('NoOfQuestions/ShowingCategory', (conv, { number }) => {
  console.log("I AM IN NoOfQuestions/ShowingCategory");
  no = number;
  let str = '';
  return getCall().then((data) => {
    let parameters = { // Custom parameters to pass with context
      NoOfQuestions: true,
    };
    conv.contexts.set('sessions', 30, parameters);
    console.log("SESSIONS", conv.contexts.input.sessions);
    console.log("DATA", data);
    a = 0;
    str = "Select one category";
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
    str += "Say like first or second to select a category";
    str = ssval.correct(str);
    conv.ask('<speak>' + str + '</speak>');
    repeat = '<speak>' + str + '</speak>';
    a = 3;
  }).catch((error) => {
    let parameters = { // Custom parameters to pass with context
      error: true,
    };
    conv.contexts.set('sessions', 30, parameters);
    console.log("----ERROR----", error);
    repeat = "Sorry, an error has occurred . Do you want to cancel this wave and start a new session";
    return conv.ask('Sorry, an error has occurred . Do you want to cancel this wave and start a new session');
  });
});

app.intent('YesIntent', (conv) => {
  if ((conv.contexts.input.sessions.parameters.ShowingMoreQuesYESNo === true)) {
    let parameters = { // Custom parameters to pass with context
      ShowingMoreQuesYESNo: false,
    };
    conv.contexts.set('sessions', 30, parameters);
    console.log("SESSIONS", conv.contexts.input.sessions);
    conv.contexts.delete('sessions');
    b = 1;
    c = 0;
    repeat = "How many questions do you want?";
    return conv.ask("How many questions do you want?");
  }
  else if ((conv.contexts.input.sessions.parameters.error === true)) {
    console.log("SESSIONS", conv.contexts.input.sessions);
    conv.contexts.delete('sessions');
    repeat = "Welcome to Knowledge Quest . How many questions do you want?";
    return conv.ask("Welcome to Knowledge Quest . How many questions do you want?");
  }
  else
    return conv.ask("Please give a correct response");
});

app.intent('NoIntent', (conv) => {
  if ((conv.contexts.input.sessions.parameters.ShowingMoreQuesYESNo === true)) {
    let parameters = { // Custom parameters to pass with context
      ShowingMoreQuesYESNo: false,
    };
    conv.contexts.set('sessions', 30, parameters);
    conv.contexts.delete('sessions');
    return conv.close("Good bye . have a nice day");
  }
  else
    return conv.ask("Please give a correct response");

});

app.intent('MoreIntent', (conv) => {
  console.log("I AM IN MoreIntent");
  if ((conv.contexts.input.sessions.parameters.NoOfQuestions === true || conv.contexts.input.sessions.parameters.Moreintent === true)) {
    let parameters = { // Custom parameters to pass with context
      NoOfQuestions: true,
      Moreintent: true
    };
    conv.contexts.set('sessions', 30, parameters);
    let str = '';
    global.count = a + 3;
    if (name_arr[a] === undefined) {
      repeat = "Sorry , No more Categories are there";
      return conv.ask("Sorry , No more Categories are there");
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
      repeat = str;
      str = ssval.correct(str);
      console.log("STR", str);
      repeat = '<speak>' + repeat + '</speak>';
      return conv.ask('<speak>' + str + '</speak>');
    }
  }
  else
    return conv.ask("please give a correct response");
});

app.intent('SelectingCategory/ShowingDifficulty', (conv, { ordinal }) => {
  console.log("SelectingCategory/ShowingDifficulty");

  if ((conv.contexts.input.sessions.parameters.NoOfQuestions === true || conv.contexts.input.sessions.parameters.Moreintent === true)) {
    id = dict[name_arr[ordinal - 1]];
    console.log("ID", id);
    return getIDQues(id).then((data) => {
      if (no <= data.category_question_count.total_question_count) {
        let parameters = { // Custom parameters to pass with context
          SelectingCategory: true,
          NoOfQuestions: false,
          Moreintent: false
        };
        conv.contexts.set('sessions', 30, parameters);
        repeat = "Select Difficulty level : Easy, Medium, or Hard";
        return conv.ask("Select Difficulty level : Easy, Medium, or Hard");
      }
      else {
        repeat = `Sorry, we don't have that much questions in that category .  We have ${data.category_question_count.total_easy_question_count} in easy . ${data.category_question_count.total_medium_question_count} in medium . ${data.category_question_count.total_hard_question_count} in hard . Now, how many questions do you want`;
        return conv.ask(`Sorry, we don't have that much questions in that category .  We have ${data.category_question_count.total_easy_question_count} in easy . ${data.category_question_count.total_medium_question_count} in medium . ${data.category_question_count.total_hard_question_count} in hard . Now, how many questions do you want`);
      }
    }).catch((error) => {
      let parameters = { // Custom parameters to pass with context
        error: true,
      };
      conv.contexts.set('sessions', 30, parameters);
      console.log("----ERROR----", error);
      repeat = "Sorry, an error has occurred . Do you want to cancel this wave and start a new session";
      return conv.ask('Sorry, an error has occurred . Do you want to cancel this wave and start a new session');
    });
  }
  else if (conv.contexts.input.sessions.parameters.ShowingQues === true || conv.contexts.input.sessions.parameters.ShowingMoreQues === true) {
    let parameters = { // Custom parameters to pass with context
      ShowingMoreQues: true,
      ShowingQues: false
    };
    conv.contexts.set('sessions', 30, parameters);
    let str = '';
    if (b < no) {
      let a = 0;
      var numbers = [0, 1, 2, 3];
      var random = shuffle(numbers);
      console.log("B", b);
      console.log("RESULTS 2", results);
      if (answers[ordinal - 1] === results[b - 1].correct_answer) {
        let s = "That's a right answer . Next Question . ";
        c++;
      }

      else {
        let s = "That's a wrong answer . Correct answer is . " + results[b - 1].correct_answer + " . Next question . ";
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
      str=he.decode(str);
      str=ssval.correct(str);
      repeat='<speak>' + str + '</speak>';
      str=s+str;
      str=he.decode(str);
      str=ssval.correct(str);
      return conv.ask('<speak>' + str + '</speak>');
    }
    else {
      let parameters = { // Custom parameters to pass with context
        ShowingMoreQues: false,
        ShowingMoreQuesYESNo: true
      };
      conv.contexts.set('sessions', 30, parameters);
      if (answers[ordinal - 1] === results[b - 1].correct_answer) {
        let k = "That's a right answer . ";
        c++;
      }
      else {
        let k = "That's a wrong answer . ";
        k += "Correct answer is . " + results[b - 1].correct_answer;
      }  
      str = ` . Well played . Your score is ${c} out of ${no} . Do you want to play another session ?`;
      repeat=str;
      str=k+str
      return conv.ask(str);
    }
  }
  else {
    return conv.ask("please give a correct response");
  }
});

app.intent('SelectingDifficulty/ShowingQuestions', (conv, { Type }) => {
  type = Type;
  console.log("TYPE", type);
  console.log("I AM IN SelectingDifficulty/ShowingQuestions");
  if (conv.contexts.input.sessions.parameters.SelectingCategory === true) {
    let a = 0;
    let str = '';
    return getQues().then((data) => {
      let parameters = { // Custom parameters to pass with context
        SelectingCategory: false,
        ShowingQues: true
      };
      conv.contexts.set('sessions', 30, parameters);
      results = data;
      console.log("RESULTS", results);
      var numbers = [0, 1, 2, 3];
      var random = shuffle(numbers);
      while (a < 3) {
        answers[random[a]] = data[0].incorrect_answers[a];
        a++;
      }
      answers[random[3]] = data[0].correct_answer;
      str += "Here's your first question . ";
      str += data[0].question;
      console.log("ANSWERS", answers);
      a = 0;
      while (a < 4) {
        str += `<say-as interpret-as="ordinal">${(a + 1)}</say-as>. ${answers[a]} . `;
        a++;
      }
      str += "Say like first or second to select an option ";
      str = he.decode(str);
      str = ssval.correct(str);
      repeat = '<speak>' + str + '</speak>';
      return conv.ask('<speak>' + str + '</speak>');

    }).catch((error) => {
      let parameters = { // Custom parameters to pass with context
        error: true,
      };
      conv.contexts.set('sessions', 30, parameters);
      console.log("----ERROR----", error);
      repeat = "Sorry, an error has occurred . Do you want to cancel this wave and start a new session";
      return conv.ask('Sorry, an error has occurred . Do you want to cancel this wave and start a new session');
    });
  }
  else {
    return conv.ask("Please give a correct response");
  }
});

app.intent('RepeatIntent', (conv) => {
  return conv.ask(repeat);
});

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

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
