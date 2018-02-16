// 1. Text strings =====================================================================================================

var speechOutput;
var reprompt;
var welcomeOutput = "Willkommen zu deiner Vorratskammer. Wie kann ich dienen?";


var welcomeReprompt = "Lass es mich wissen wenn du Hilfe brauchst";
var askAgain = [
    "<break time='1s'/>Kann ich dir sonst noch behilflich sein?",
    "<break time='1s'/>Kann ich dir sonst noch weiterhelfen?"
];
var foodIntro = [
    "Das hört sich gut an ",
    '<say-as interpret-as="interjection">alles klar.</say-as>'
];
var stopOutput = [
    "<say-as interpret-as='interjection'>alles klar.</say-as> Bis zum nächsten mal ",
    "Bis zum nächsten mal "
];

// 2. Skill Code =======================================================================================================

'use strict';
var Alexa = require("alexa-sdk");
var storage = require("./storage");

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', welcomeOutput, welcomeReprompt);
    },
    'SetNewFood': function () {
        var filledSlots = delegateSlotCollection.call(this);

        var speechOutput = randomPhrase(foodIntro);

        var food = this.event.request.intent.slots.food.value;
        var amount = this.event.request.intent.slots.amount.value;
        var date = this.event.request.intent.slots.date.value;

        amount=parseInt(amount);

        if (date.indexOf('W') > -1)
        {
            var year = getTheYear(date);
            var weekNumber = getNumberAfterWeek(date);
            var newDate = getDateOfWeek(weekNumber,year);

        }
        else{
            var newDate = date;
        }

        if(this.event.request.dialogState == "COMPLETED"){
            storage.save(food, npm install -g json, amount, (food) => {
                speechOutput+="Ich füge "+ amount + " " + food + "hinzu";
                speechOutput+= randomPhrase(askAgain);
                this.emit(':ask', speechOutput);
        });
        }
    },
    'SetNewFoodWithDuration': function () {
        var filledSlots = delegateSlotCollection.call(this);
        var speechOutput = randomPhrase(foodIntro);
        var food = this.event.request.intent.slots.food.value;
        var amount = this.event.request.intent.slots.amount.value;
        var duration = this.event.request.intent.slots.duration.value;
        amount=parseInt(amount);

        if (duration.indexOf('D') > -1){
            duration = getOnlyNumber(duration);
           var date = addDaysAndFormat(duration);
        }
        else if(duration.indexOf('W') > -1){
            duration = getOnlyNumber(duration);
            duration= duration*7;
            var date = addDaysAndFormat(duration);
        }
        else if(duration.indexOf('Y') > -1){
            duration = getOnlyNumber(duration);
            duration= duration*365;
            var date = addDaysAndFormat(duration);
        }

        if(this.event.request.dialogState == "COMPLETED"){
            storage.save(food, date, amount, (food) => {
                speechOutput+="Ich füge "+ amount + " " + food + "hinzu";
            speechOutput+= randomPhrase(askAgain);
            this.emit(':ask', speechOutput);
        });
        }
    },
    'GetFoodCount': function () {
        var response = '';
        var food = this.event.request.intent.slots.food.value;

        storage.getFoodCount(food, (amount) => {
            if(amount == '1' || amount == 1 || amount.valueOf() == 'eins' || amount.valueOf() == '1'
        )
        {
            response = 'Du hast noch eine ' + food + ' im Kühlschrank.';
        }
        else
        {
            response = 'Du hast noch, ' + amount + ' ' + food + ' im Kühlschrank.';
        }
        response+= randomPhrase(askAgain);
        this.emit(':ask', response);
    });
    },
    'GetDateOfFood': function () {
        var response = '';
        var food = this.event.request.intent.slots.food.value;

        storage.GetDateOfFood(food, (date) => {
            date.toString();
        response = 'Deine ' + food + ' werden am ';
        response+= date + ' ablaufen.';
        response+= randomPhrase(askAgain);

        this.emit(':ask', response);
    });
    },
    'GetExpiringFood': function () {

        var response = '';
        var testString = '';

        storage.GetExpiringFood((items) => {
            testString = items.toString();
        response = 'Demnächst laufen folgende Lebensmittel ab:  ' + testString;
        response+= randomPhrase(askAgain);
        this.emit(':ask', response);
    });
    },
    'GetEverything': function () {
        var response = '';

        storage.GetEverything(  (items) => {
            string = items.toString();
        if(string){
            response = 'Du hast noch folgende Lebensmittel im Kühlschrank:  ' + string;
        }
        else{
            response = 'Dein Kühlschrank ist leer.';
        }

        response+= randomPhrase(askAgain);
        this.emit(':ask', response);
    });
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, das habe ich nicht verstanden', 'Versuch es nocheinmal');
    },
    'AMAZON.YesIntent': function () {
        speechOutput = "Und was möchtest du gerne tun?";
        this.emit(':ask', speechOutput);
    },
    'AMAZON.NoIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function () {
        speechOutput = "Du kannst zum Beispiel folgendes sagen: <break time='0.5s'/> " +
            "Zwei Tomaten hinzufügen <break time='0.5s'/> " +
            "Wie viele Tomaten habe ich? <break time='0.5s'/> " +
            "Wann laufen meine Tomaten ab <break time='0.5s'/> " +
            "Was läuft bald ab? <break time='0.5s'/> " +
            "Du kannst auch „Stopp“ sagen, wenn du fertig bist. <break time='0.5s'/> " +
            "Was möchtest du nun tun?";
        reprompt = "";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = "";
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function () {
        speechOutput = "";
        speechOutput+= randomPhrase(stopOutput);
        this.emit(':tell', speechOutput);
    },
    'SessionEndedRequest': function () {
        var speechOutput = "Auf Wiedersehen";
        this.emit(':tell', speechOutput);
    }
};

exports.handler = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
}

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function delegateSlotCollection(){
    console.log("in delegateSlotCollection");
    console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
        console.log("in Beginning");
        var updatedIntent=this.event.request.intent;
        //optionally pre-fill slots: update the intent object with slot values for which
        //you have defaults, then return Dialog.Delegate with this updated intent
        // in the updatedIntent property
        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        // return a Dialog.Delegate directive with no updatedIntent property.
        this.emit(":delegate");
    } else {
        console.log("in completed");
        console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent;
    }
}

function randomPhrase(array) {
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}

function isSlotValid(request, slotName){
    var slot = request.intent.slots[slotName];
    var slotValue;

    if (slot && slot.value) {
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        return false;
    }
}

function addDaysAndFormat(addDays){
    var date = new Date();
    var numberOfDaysToAdd = addDays;
    date.setDate(date.getDate() + numberOfDaysToAdd);
    var newDate = date.toISOString().slice(0,10);

    return newDate
}

function getDateOfWeek(wn, year) {
    var j10 = new Date( year,0,10,12,0,0),
        j4 = new Date( year,0,4,12,0,0),
        mon1 = j4.getTime() - j10.getDay() * 86400000;
    var date = new Date(mon1 + ((wn - 1)  * 7) * 86400000);
    var newDate = date.toISOString().slice(0,10);

    return newDate
}

function getNumberAfterWeek(someDate) {
    return someDate.split('W')[1];
}

function getTheYear(year){
    return year.substring(0, 4);
}

function getOnlyNumber(duration){
    var numb = duration.match(/\d/g);
    numb = numb.join("");
    numb = parseInt(numb);
    return numb
}