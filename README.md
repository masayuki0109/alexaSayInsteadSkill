#alexaスキル「お願いです」

##概要
2019年のエイプリルフール前に、ネタスキルとしてリリース。
alexaのリマインダーAPIを使用して、指定した時間後に
「お願いですから、fugaさん。hogehogeして下さい」
と、alexaが代わりに誰かにお願いしてくれるだけのスキルです。

###Amazonストアリンク
リンク[https://www.amazon.co.jp/Masayuki-%E3%81%8A%E9%A1%98%E3%81%84%E3%81%A7%E3%81%99/dp/B07Q2WM8RT/ref=sr_1_1?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&keywords=%E3%81%8A%E9%A1%98%E3%81%84%E3%81%A7%E3%81%99&qid=1555157562&s=digital-skills&sr=1-1-catcorr]

##ReminderControllerについて
リマインダーAPIを使用する際に必要になる処理をまとめています。

###directive
リマインダーAPIは、一度の処理で4つ以上（環境による）セットすると10秒程度時間がかかります。
Amazonの審査では8秒以上応答がないと、審査が通過しません。
directiveApiを叩くことで、待ち時間にalexa発話します。

###askPermission
ユーザーにリマインダーの許可を求めるカードをalexaアプリに送信します。

