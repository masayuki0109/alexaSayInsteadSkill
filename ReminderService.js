const Alexa = require('ask-sdk')

class ReminderService {
    constructor(handlerInput){
        this.handlerInput = handlerInput;
        this.apiClient = new Alexa.DefaultApiClient();
        this.reminderApiPath = '/v1/alerts/reminders';
        this.token = handlerInput.requestEnvelope.context.System.apiAccessToken;
        this.apiEndpoint = handlerInput.requestEnvelope.context.System.apiEndpoint;
        this.requestId = handlerInput.requestEnvelope.request.requestId;
    }
    
    async createRelative(message, offsetInSeconds)  {
 
        const body = {
            requestTime : (new Date()).toISOString(),
            trigger: {
                type : "SCHEDULED_RELATIVE",
                offsetInSeconds : offsetInSeconds,
            },
            alertInfo: {
                spokenInfo: {
                    content: [{
                        locale: "ja-JP",
                        text: message
                    }]
                }
            },
            pushNotification : {                            
                status : "ENABLED"                         
            }
        }
 
        const request  = {
            body : JSON.stringify(body),
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            method : 'POST',
            url : this.apiEndpoint + this.reminderApiPath,
        };

        const response =  await this.apiClient.invoke(request);
        // if(response.statusCode == 201){
        if(response.statusCode >= 200 && response.statusCode <= 210){
            return true;
        }
        const responsBody = JSON.parse(response.body)
        return false;
    }
    async remindRelative(message, offsetInSeconds,successMessage,failMessage){
        const result = await this.createRelative(message,offsetInSeconds);
        if (result){
            //成功
            return this.handlerInput.responseBuilder
                      .speak(successMessage)
                      .getResponse();
        } else {
            return this.askPermission(failMessage);
        }
    }
    
    async createAbsolute(message,alertDay){
        const remindDay = (alertDay.toISOString()).slice(0,-1);
        const body = {
            requestTime : (new Date()).toISOString(),
            trigger: {
                type : "SCHEDULED_ABSOLUTE",
                scheduledTime : remindDay,
                recurrence : {
                    freq : "WEEKLY",
                    byDay: ["MO"],
                }
            },
            alertInfo: {
                spokenInfo: {
                    content: [{
                        locale: "ja-JP",
                        text: message
                    }]
                }
            },
            pushNotification : {                            
                status : "ENABLED"                         
            }
        }
 
        const request  = {
            body : JSON.stringify(body),
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            method : 'POST',
            url : this.apiEndpoint + this.reminderApiPath,
        };

        const response =  await this.apiClient.invoke(request);
        // if(response.statusCode == 201){
        if(response.statusCode >= 200 && response.statusCode <= 210){
            // console.log("成功！！！！")
            // const body = JSON.parse(response.body)
            return 'success';
        }
        const responsBody = JSON.parse(response.body)
        console.log(responsBody,"失敗したよ！！！！！！")
        return responsBody["code"];
    }
    
    askPermission(message){
        const PERMISSIONS = ['alexa::alerts:reminders:skill:readwrite'];
        return this.handlerInput.responseBuilder
            .speak(message)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
    }
    
    
    async requestApi(id,method){
        const request ={
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            method : method,
            url : this.apiEndpoint + this.reminderApiPath +　'/' + id,
        };
        const response =  await this.apiClient.invoke(request);
        if(response.statusCode >= 200 && response.statusCode <= 210){
            return true;
        }
        // console.log(response,"失敗",response.statusCode)
        return false;
    }
    
    
    async getReminders(id){
        return await this.requestApi(id,'GET');
    }
    
    async deleteReminder(id){
        return await this.requestApi(id,'DELETE');
    }
    
    async deleteAll(deleteM,EmptyM,falilM){
        const arr = await this.getOnRemindIdArr();
        console.log(`${arr}の中身`)
        if (arr.length === 0) {
            return EmptyM
        } else if (!arr){
            return falilM
        }
        for (let index in arr){
            console.log(index,arr[index]);
            const result = await this.deleteReminder(arr[index]);
            console.log(`削除結果:${result}`)
            if (!result) {
                return falilM
            }
        }
        return deleteM
    }
    
    async getAllremind(){
        const request ={
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            method : 'GET',
            url : this.apiEndpoint + this.reminderApiPath,
        };
        const response =  await this.apiClient.invoke(request);
        if(response.statusCode >= 200 && response.statusCode <= 210){
            console.log("成功！！！！")
            const body =JSON.parse(response.body)
            return body;
        }
        console.log(response,"失敗",response.statusCode)
        return false;
    }
    
    
    async getOnRemindIdArr(){
        const body = await this.getAllremind();
        const alrets = body.alerts;
        if (!alrets){ return false}
        let idArr = [];
        alrets.forEach( function(alert,index){
        //   console.log(`${index}目：${alert.status}`)
          if (alert.status === 'ON')
            idArr.push(alert.alertToken)
        })
        console.log(idArr)
        return idArr
    }
    
    
    async getOnRemindObject(){
        const body = await this.getAllremind();
        const alrets = body.alerts;
        if (!alrets){ return []}
        let arr = [];
        alrets.forEach( function(alert,index){
          if (alert.status === 'ON')
            arr.push(alert)
        })
        // console.log(arr)
        return arr
    }
    
    
    async directivesApi(message){
        const body = {
          "header":{ 
            "requestId": this.requestId
          },
          "directive":{ 
            "type":"VoicePlayer.Speak",
            "speech":`${message}`
          }
        }
        const request ={
            headers : [ {key : 'Authorization', value : `Bearer ${this.token}`} ,
            {key: 'Content-Type', value : 'application/json'}],
            body : JSON.stringify(body),
            method : "POST",
            url : this.apiEndpoint + '/v1/directives'
        };
        
        const response =  await this.apiClient.invoke(request);
        if(response.statusCode >= 200 && response.statusCode <= 210){
            return true;
        }
        console.log(response,"ダイレクト失敗",response.statusCode)
        return false;
    }
    
}

module.exports = ReminderService;