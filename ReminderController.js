const ReminderBase = require('./ReminderBase.js').ReminderBase;
const JsonBodyCreater = require('./ReminderBase.js').JsonBodyCreater;

class ReminderController extends ReminderBase{
    constructor(handlerInput){
        super(handlerInput)
        this.jsonBodyCreater = new JsonBodyCreater()
    }
    
    async setRelative(message,offsetSecond){
        const body = this.jsonBodyCreater.createRelativeBody(message,offsetSecond);
        return await this.reminderApi('POST',body)
    }
    async setAbsolute(message,alertDay,byDay){
        const body = this.jsonBodyCreater.createAbsolute(message,alertDay,byDay);
        return await this.reminderApi('POST',body)
    }

    async deleteReminder(id){
        return await this.reminderApi('DELETE',null,id);
    }

    async fetchAll(){
        const reminders = await this.reminderApi('GET')
        return reminders
    }

    async fetchOnOnly(){
        const body = await this.fetchAll();
        if (!body || body.lenght === 0) {
            return null
        }
        const reminders = body.alerts;
        let arr = [];
        reminders.forEach( function(reminder,index){
            if (reminder.status === 'ON')
              arr.push(reminder)
          })
        return arr
    }

    async deleteAll(){
        const reminders = await this.fetchOnOnly();
        if (!reminders){
            return null
        }
        for (let index in reminders){
            console.log(index,reminders[index],'どう？');
            // const reminder = JSON.parser(reminders[index]);
            const id = reminders[index].alertToken;
            const result = await this.deleteReminder(id);
            console.log(`削除結果:${result}`)
            if (!result) {
                return false
            }
        }
        return true
    }

    askPermission(message){
        const PERMISSIONS = ['alexa::alerts:reminders:skill:readwrite'];
        return this.handlerInput.responseBuilder
            .speak(message)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
    }

    async directives(message){
        const body = {
            "header": {
                "requestId": this.requestId
            },
            "directive": {
                "type": "VoicePlayer.Speak",
                "speech": `${message}`
            }
        }
        const url = this.apiEndpoint + this.directivesApiPath;
        this.requestApi("POST",url,body)
    }

}

module.exports = ReminderController;