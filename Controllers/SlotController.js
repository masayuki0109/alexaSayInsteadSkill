const Alexa = require('ask-sdk');

class SlotController{
    constructor(handlerInput){
        this.slots = handlerInput.requestEnvelope.request.intent.slots;
    }
    getObjects(){
        return this.slots;
    }
    
    getKeyValue(){
        let dic = {};
        for (let label in this.slots){
            let object = {};
            const slot = this.slots[label]
            object['slotName'] = label;
            object['value'] = slot.value;
            if(slot.resolutions
                && slot.resolutions.resolutionsPerAuthority[0]
                && slot.resolutions.resolutionsPerAuthority[0].values){
                object['id'] = slot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
                object['name'] = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            }
            dic[label] = object
        }
        return dic
    }
    
    getValue(key){
        const slot = this.slots[key];
        return slot ? slot.value : null;
    }

}


    
    

class Times{
    constructor(duration){
        const m  = duration.match(/(^PT)(\d+H)?(\d+M)?(\d+S)?/);
        const hour = this.durationParser(m, 3);
        const minute = this.durationParser(m, 4);
        const second = this.durationParser(m, 5);
        console.log(`${hour}時間${minute}分${second}秒`)
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    
    }
    init(hour,minute,second){
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }
    durationParser(m,length){
        if (m === null){ return null}
        if (m.length < length) {
            return '';
        } else if (!m[length - 1]) {
            return ''
        } else {
            return m[length - 1].slice(0, -1);
        }
    }
    
    sumSecond(){
        return this.hour * 60 * 60 + this.minute * 60 + this.second;
    }
    convertString(){
        let text = '';
        if (this.hour){
            text += this.hour + '時間';
        }
        if (this.minute){
            text += this.minute + '分';
        }
        if (this.second){
            text += this.second + '秒';
        }
        return text
    }
    convertTimes(inputSecond){
        this.hour = Math.floor(inputSecond / (60 * 60));
        this.minute = Math.floor((inputSecond % (60 * 60)) / 60);
        this.second  = Math.floor(inputSecond - this.hour * (60 * 60) - (this.minute * 60));
    }
}


module.exports = {
    SlotController:SlotController,
    Times:Times,
    };