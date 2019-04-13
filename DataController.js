class DataControlloer{
  constructor(handlerInput){
    this.handlerInput = handlerInput;
  }
  
  //getSessionAttribuesまでのアクセスが長いので作成
  tmpSave(key,value){
    const attributes = this.handlerInput.attributesManager.getSessionAttributes();
    attributes[key] = value;
    this.handlerInput.attributesManager.setSessionAttributes(attributes)
  }
  //引数のattributes keyの値をnullに
  reset(){
    for (var i = 0; i < arguments.length; i++) {
      const key = arguments[i];
      this.tmpSave(key,null);
    }
  }
  //引数に与えられた、attributes keyの値が存在するかチェック。canHandleのチェックで使用
  tmpDataCheckExist(){
    for (var i = 0; i < arguments.length; i++) {
      const key = arguments[i];
      const data = this.getTmpData(key);
      console.log(`${key}の値は${data}で、真偽値は${!data}です。`)
      if (!data) {
        return false;
      }
    }
    return true;
  }
  //短縮のために
  getTmpData(key){
    const attributes = this.handlerInput.attributesManager.getSessionAttributes();
    return attributes[key];
  }
  
  async getPersiData(key){
    if(!key){ return null }
    let attributes = await this.handlerInput.attributesManager.getPersistentAttributes()
    return attributes[key];
  }
  
  async saveData(key, value) {
    if (value == null || value == undefined) {
      // console.log('saveData is empty');
      return false
    }
    let attributes = await this.handlerInput.attributesManager.getPersistentAttributes();
    attributes[key] = value
    this.handlerInput.attributesManager.setPersistentAttributes(attributes);
    await this.handlerInput.attributesManager.savePersistentAttributes();
    // console.log(`key:${key}  value:${value}`);
    return true
  }
}

module.exports = DataControlloer;