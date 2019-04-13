
const Alexa = require('ask-sdk');
const SlotController = require('./Controllers/SlotController.js').SlotController;
const Times = require('./Controllers/SlotController.js').Times;

const DataControlloer = require('./Controllers/DataController.js');
const ReminderController = require('./Controllers/ReminderController.js');



//■■■■■■■■■■■■■■■■alexaが発話するテキスト■■■■■■■■■■■■■■■■
const SKILL_NAME = 'お願いメーカー';
const WHO_ASK = '誰にお願いしますか？';
const HOW_MANY_TIME = '何ふん後にお伝えしましょうか？'
const OPEN_MESSAGE = '私があなたに変わってお願いしましょう！' + WHO_ASK;
const ASK_AGAIN = '誰にお願いしますか？？';
const FAILMESSAGE = 'すみません。リマインダーの作成に失敗しました。アレクサアプリのアクティビティから' +
                    'このスキルのリマインダー使用許可が有効になっているか確認して下さい。';
const HELP_MESSAGE = 'このスキルは、普段言いづらいことやお願いしづらいことをあなたに変わってお願いするスキルです。' +
                     '奥様にお小遣いアップをお願いしたり、旦那様に皿洗いを願いしたり、直接お願いして断られる内容でも' +
                     'このスキルが代わりにすれば願いが叶うかもしれません。';

const ASK_PERMISSION = '指定した時間にリマインダーであなたのお願いを読上げます。アレクサアプリのアクティビティに' +
                     'リマインダーの許可方法を送信しました。アレクサアプリでリマインダーの使用を許可して下さい。';

const WAIT_SET_RIMINDER = 'リマインダーをセットしています。お待ち下さい。';
const SET_REMINDER_SUCCESS = 'リマインダーをセットしました。後は私に任せて下さい。<say-as interpret-as="interjection">また後ほど	</say-as>';


const WAIT_DELETE = 'リマインダーを削除しています。お待ち下さい。';
const DELETE_SUCCESS = 'このスキルで作成したリマインダーを削除しました';
const DELETE_FAIL = 'すみません。リマインダーの削除に失敗しました。アレクサアプリのリマインダーから削除して下さい。';
const NOT_FOUND_RIMINDERS = 'まだ、このスキルで作成したリマインダーはありません。';

const ERROR_MESSAGE = 'すみません。問題が発生しました。スキルを終了します。'
const STOP_MESSAGE = 'スキルを終了しました。<say-as interpret-as="interjection">またいつでもどうぞ</say-as>';

//■■■■■■■■■■■■■■■■KEYS■■■■■■■■■■■■■■■■
const WANT = 'Want';
const WHO = 'Who';
const WHEN = 'When';
const REMIND_MESSAGE = 'remind_message';
const REMIND_TIME = 'remind_time';
const NOTNEW = 'not_new_user'
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


//■■■■■■■■■■■■テスト用ハンドラ■■■■■■■■
//使うときは、return true に変更。
const TestHandler = {
  canHandle(handlerInput) {
    return false
  },
  async handle(handlerInput) {
    const reminder = new ReminderController(handlerInput);
    await reminder.directives(WAIT_DELETE);
    await reminder.setRelative('リマインダークラスのテスト',1000)
    await reminder.setRelative('リマインダークラスのテスト',2000)
    await reminder.deleteAll();


    return handlerInput.responseBuilder
      .speak('クラステスト')
      .getResponse();
  },
}
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■


const OpenHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
    || (request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const dataController = new DataControlloer(handlerInput);
    dataController.reset(REMIND_MESSAGE,REMIND_TIME)
    return handlerInput.responseBuilder
      .speak(WHO_ASK)
      .reprompt(ASK_AGAIN)
      .getResponse();
  },
};


const WhoHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'WhoIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope
    
    const slotController = new SlotController(handlerInput);
    const dataController = new DataControlloer(handlerInput);
    const slots = slotController.getKeyValue();
    
    // console.log(request.request.intent.slots.Who.value)
    
    let person = slots[WHO].name ? slots[WHO].name : slots[WHO].value + 'さん';
    dataController.tmpSave(WHO,person);
    const message = `${person}へお願いする内容を教えて下さい。<break time="500ms"/>言い終わったら最後に、` +
    `<break time="500ms"/>とお願いして。<break time="500ms"/>といって下さい。`;
    
    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};

const WhatHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'WhatIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope
    
    const slotController = new SlotController(handlerInput);
    const dataController = new DataControlloer(handlerInput);
    const slots = slotController.getKeyValue();
    
    let person = dataController.getTmpData(WHO);
    
    //万が一 personがundefinedの時に、読上げないように空文字を入れる処理。
    //スロット必須にしているため、undefinedになることは無いはず
    let message = person ? `${person}。` : '';
    

    message += slots[WANT].value
    
    dataController.tmpSave(REMIND_MESSAGE,message);
    
    return handlerInput.responseBuilder
      .speak(HOW_MANY_TIME)
      .reprompt(HOW_MANY_TIME)
      .getResponse();
  },
};


const DurationHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'
        && request.intent.name === 'DurationIntent');
  },
  handle(handlerInput) {

    const slotController = new SlotController(handlerInput);
    const dataController = new DataControlloer(handlerInput);
    
    const slots = slotController.getKeyValue();
    
    
    const duration = (slots[WHEN]).value;
    const times = new Times(duration);
    console.log(times.sumSecond());
    dataController.tmpSave(REMIND_TIME,times.sumSecond());
    

    
    const message = dataController.getTmpData(REMIND_MESSAGE);
    let ask_message = WHO_ASK;
    if (message){
      ask_message = message + `<break time="1s"/>と${times.convertString()}後にリマインダーでお伝えしていいですか？`
    }
    //↑リマインダーのセット前に逐次リマインダーのセットをユーザーに確認しないと審査通らない
    
    return handlerInput.responseBuilder
      .speak(ask_message)
      .reprompt(ask_message)
      .getResponse();
  },
};


const SetRemindHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.YesIntent';
  },
  async handle(handlerInput) {
    const dataController = new DataControlloer(handlerInput);
    const allExist = dataController.tmpDataCheckExist(REMIND_MESSAGE,REMIND_TIME);
    if (!allExist){
      //tmpDataのREMIND_MESSAGE・REMIND_TIMEどちらかがからの場合、初めから聞き直す
      const message  = WHO_ASK
      return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
    }
    
    
    const reminderController = new ReminderController(handlerInput);
    
    const remindMessage = dataController.getTmpData(REMIND_MESSAGE);
    const second = dataController.getTmpData(REMIND_TIME)
    console.log(second);
    await reminderController.directives(WAIT_SET_RIMINDER);
    
    
    const result = await reminderController.setRelative(remindMessage,second);
    if (!result){
      return reminderController.askPermission(FAILMESSAGE)
    }
    
    return handlerInput.responseBuilder
      .speak(SET_REMINDER_SUCCESS)
      .getResponse();
    
  },
};

const DeleteRemindHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'DeleteRemind';
  },
  async handle(handlerInput) {
    const reminderController = new ReminderController(handlerInput);
    await reminderController.directives(WAIT_DELETE);

    let message = DELETE_SUCCESS;
    const result = await reminderController.deleteAll();
    
    if(!result){
      message = DELETE_FAIL;
    }

    return handlerInput.responseBuilder
      .speak(message)
      .getResponse();
  },
};




const HelpHandler = {
  async canHandle(handlerInput) {
    const dataController = new DataControlloer(handlerInput);
    const notNew = await dataController.getPersiData(NOTNEW);
    
    const request = handlerInput.requestEnvelope.request;
    return !notNew
      || (request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent');
  },
  async handle(handlerInput) {
    const dataController = new DataControlloer(handlerInput);
    const reminderController = new ReminderController(handlerInput);
    const notNew = await dataController.getPersiData(NOTNEW);
    let message = HELP_MESSAGE;
    if (notNew){
      message += WHO_ASK;
      return handlerInput.responseBuilder
        .speak(message)
        .reprompt(WHO_ASK)
        .getResponse();      
    }
    await dataController.saveData(NOTNEW,true);
    message += ASK_PERMISSION;
    return reminderController.askPermission(message)
  },
};



const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent'
        || request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};



const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak(ERROR_MESSAGE)
      .getResponse();
  },
};




const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    TestHandler,
    WhoHandler,
    WhatHandler,
    DurationHandler,
    HelpHandler,
    OpenHandler,
    SetRemindHandler,
    DeleteRemindHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName("SayInstead")
  .withAutoCreateTable(true)
  .lambda();



