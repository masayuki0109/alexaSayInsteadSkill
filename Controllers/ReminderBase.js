const Alexa = require('ask-sdk')

class ReminderBase {
    constructor(handlerInput) {
        this.handlerInput = handlerInput;
        this.apiClient = new Alexa.DefaultApiClient();
        this.reminderApiPath = '/v1/alerts/reminders';
        this.directivesApiPath = '/v1/directives';
        this.token = handlerInput.requestEnvelope.context.System.apiAccessToken;
        this.apiEndpoint = handlerInput.requestEnvelope.context.System.apiEndpoint;
        this.requestId = handlerInput.requestEnvelope.request.requestId;
    }

    async requestApi(method,url,body = null){        
        const request ={
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            method : method,
            url : url,
        };
        if (body){
            request.body = JSON.stringify(body)
        }
        const response =  await this.apiClient.invoke(request);
        if(response.statusCode >= 200 && response.statusCode <= 210){
            if (method !== 'GET') { 
                return true 
            }
            const body =JSON.parse(response.body)
            return body;
        }
        const responsBody = JSON.parse(response.body)
        console.log(responsBody,`${method} request fail`)
        return false;
    }

    async reminderApi(method,body = null,id = null){
        const baseUrl = this.apiEndpoint + this.reminderApiPath;
        let url = id ? baseUrl + '/' + id : baseUrl

        return await this.requestApi(method,url,body);
    }
}


class JsonBodyCreater {
    constructor() {
        this.body = {
            requestTime: (new Date()).toISOString(),
            trigger: {},
            alertInfo: {
                spokenInfo: {
                    content: [{
                        locale: "ja-JP",
                    }]
                }
            },
            pushNotification: {
                status: "ENABLED"
            }
        }
    }
    createRelativeBody(message, offsetInSeconds) {
        this.body.trigger = {
            type: "SCHEDULED_RELATIVE",
            offsetInSeconds: offsetInSeconds
        }
        this.body.alertInfo.spokenInfo.content[0].text =  message;
        return this.body
    }

    createAbsolute(message,alertDay,byDay = null){
        let freq = byDay ? "WEEKLY" : "DAILY"; 
        const remindDay = (alertDay.toISOString()).slice(0,-1)
        this.body.trigger = {
            type: "SCHEDULED_ABSOLUTE",
            scheduledTime : remindDay,
            recurrence : {
                freq : freq,
                byDay: byDay,
            }
        }
        this.body.alertInfo.spokenInfo.content[0].text =  message;
        return this.body
    }
}

module.exports = {
    ReminderBase:ReminderBase,
    JsonBodyCreater:JsonBodyCreater,
    };