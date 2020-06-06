const Discord = require('discord.js');
const client = new Discord.Client();

const gapi = require('./gapi.js');
var auth = require('./auth.json');
const token = auth.token;

const column = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ',
    'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH']
var objlist = { "1": "一王", "2": "二王", "3": "三王", "4": "四王", "5": "五王", "一": "一王", "二": "二王", "三": "三王", "四": "四王", "五": "五王","0": "集刀","集": "集刀" }


// google sheet id
const ssidlist = [
    '1d3O61h03ciUFGbf6Hdb6Nbx9_our1SGGJQLhkiD1Ngw',  //將本行更新為你們公會的表單ID 記得放在引號裡面
]

const chlist = {
    
    '708899960309153855': ssidlist[0], 
    '700695816645378078': ssidlist[0],  
    '646169028502749204': ssidlist[0],
  
    
    //在這兩個頻道中填表, 都會連結到上面的第一個表單
    //'新頻道ID': ssidlist[1],

}

//channel id : role id
// const grouptaglist = {
//     '486490020690001923': '492966022194659349', 
//     '562170871213719553': '492966022194659349', 
// }

var userlist = {}
var usercode = {}
var channelid = '' //channel to broadcast from direct message 


/************************************** */
// 避免呼叫指令時間太相近造成衝突, 此為一個排隊機制
var EventEmitter = require('events').EventEmitter;
class FunctionQueue extends EventEmitter {
    constructor(props) {
        super(props)
        this.list = []
    }

    push(fn) {
        this.list.push(fn)
        this.emit('push')
    }

    async run() {
        const results = await this.list[0]()
        this.list.shift()
        this.emit('pop', results)
    }
}

const queue = new FunctionQueue()

queue.on('push', () => {
    if (queue.list.length === 1) {
        queue.run()
    }
})
queue.on('pop', (results) => {
    // console.log('results', results)
    if (queue.list.length > 0) {
        queue.run()
    }
})

/***************************************/


client.on('ready', async () => {

    for (i in ssidlist) {
        var ul = await gapi.getUserList(ssidlist[i]);
        for (var j in ul) {
            userlist[ul[j][1]] = [ul[j][0], ssidlist[i]];
            usercode[ul[j][0]] = [ul[j][1], ssidlist[i]];
        }
    }
    console.log(userlist);
   // console.log(usercode);
    console.log(client.user.username + " is ready.");
});


client.on('message', async message => {

    if (message.author.bot) return;

    if (message.content.substring(0, 1) === "!" || message.content.substring(0, 1) === "！") {

        const args = message.content.slice(1).trim().split(/ +/g);
        const command = args.shift().toLowerCase();


        if (message.author.id in userlist && message.channel.id in chlist) {

            if (command === 'fill' || command === '填表' || command === '傷害') {
                queue.push(async () => {
                    try {
                        memberid = message.author.id;
                        demage = parseInt(args[0]);
                        if (isNaN(demage) || demage > 30000000) {
                            message.reply('傷害數值錯誤或過高!');
                            return;
                        }
                        object = '';
                        ps = '';
                        if (args.length >= 2) {
                            for (var i = 1; i < args.length; i++) {
                                arg = args[i].substring(0, 1);
                                // console.log(arg)
                                if (arg === '尾' || arg === '殘') {
                                    ps = arg;
                                }
                                else if (arg === '1' || arg === '2' || arg === '3' || arg === '4' || arg === '5'
                                    || arg === '一' || arg === '二' || arg === '三' || arg === '四' || arg === '五') {
                                    object = arg;
                                }
                                else throw new Error('不正確的fill指令: ' + message.author.username + ':' + message.content)
                            }
                        }
                        await fillandreply(message, memberid, demage, object, ps);
                    }
                    //例外狀況
                    catch (err) {
                        console.log(err);
                        message.reply('請以 <!fill 傷害數值 目標(1/1王/一王) (尾/殘)> 的形式呼叫');
                    }
                })
                return;
            }

            else if (command === 'fillfor' || command === '代填' || command === '幫填') {
                queue.push(async () => {
                    try {
                        var memberid = args[0].replace(/[^0-9\.]+/g, '');
                        if (!(memberid in userlist)) {
                            throw new Error('錯誤的成員名稱!');
                        }
                        demage = parseInt(args[1]);
                        if (isNaN(demage) || demage > 30000000) {
                            message.reply('傷害數值錯誤或過高!');
                            return;
                        }
                        object = '';
                        ps = '';
                        if (args.length >= 3) {
                            for (var i = 2; i < args.length; i++) {
                                arg = args[i].substring(0, 1);
                                // console.log(arg)
                                if (arg === '尾' || arg === '殘') {
                                    ps = arg;
                                }
                                else if (arg === '1' || arg === '2' || arg === '3' || arg === '4' || arg === '5'
                                    || arg === '一' || arg === '二' || arg === '三' || arg === '四' || arg === '五') {
                                    object = arg;
                                }
                                else throw new Error('不正確的fill指令: ' + message.author.username + ':' + message.content)
                            }
                        }
                        await fillandreply(message, memberid, demage, object, ps);
                    }
                    //例外狀況
                    catch (err) {
                        console.log(err);
                        message.reply('請以 <!fillfor @成員 傷害數值 目標 (尾/殘)> 的形式呼叫');
                    }
                })
                return;
            }

            else if (command === 'status') {
                queue.push(async () => {

                    //查自己的
                    if (args.length == 0) {
                        memberid = message.author.id;
                        statusandreply(message, memberid)
                    }
                    //查別人的
                    else if (args.length == 1) {
                        memberid = args[0].replace(/[^0-9\.]+/g, '');
                        if (!(memberid in userlist)) {
                            message.reply('錯誤的成員名稱');
                            return;
                        }
                        statusandreply(message, memberid)
                    }
                    else {
                        message.reply('請以<!status> 或 <!status @成員名稱> 的形式呼叫');
                    }
                })
                return;

            }
            else if (command === 'remind') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    leftknife = table[32][1];
                    lefttime = callefttime(5);//以五點為基準
                    message.channel.send(String.format('今天還有{0}刀未出，距離5點還有{1}', leftknife, lefttime))
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }
            else if (command === '查刀') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    // console.log(table)
                    var msg = '剩餘刀數　成員名稱\n'
                    var count = 0
                    var compenstate_count = 0
                    for (var row = 2; row < 32; row++) {
                        leftknife = table[row][1]
                        if (table[row][18] == 'v') compenstate_count += 1
                        hascompensate = table[row][18] == 'v' ? '(有殘)' : '             '
                        if (leftknife == 0 && table[row][18] != 'v') continue;
                        var group = (table[row][19] == '' || typeof table[row][19] === 'undefined') ? '' : String.format(' ({0})', table[row][19])
                        msg += String.format('{0}刀 {1}  {2}{3} ', leftknife, hascompensate, table[row][0], group)
                        count += leftknife
                        if (leftknife < 3) {
                            msg += ' 已出: '
                            for (var i = 4; i <= 14; i += 5) {
                                obj = table[row][i]
                                if (!obj.isNaN)
                                    msg += obj + ' '
                            }
                        }
                        msg += '\n'
                    }
                    if (count == 0 && compenstate_count == 0) msg = '今日已全數出完'
                    else msg += String.format('總計 {0} 刀', count)

                    message.channel.send(msg);
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }
            else if (command === 'url' || command === '表單' || command === '表格') {
                ssid = chlist[message.channel.id]//chlist[message.channel.id]
                message.channel.send('https://docs.google.com/spreadsheets/d/' + ssid);

                return;
            }

            else if (command === 'crashlist' || command === '閃退') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    var msg = '今日閃退已用成員:(若要登記閃退請使用<!登記閃退>)\n'
                    var count = 0;
                    for (var i = 2; i < 32; i++) {
                        if (table[i][2]) {
                            msg += table[i][0] + '\n';
                            count++;
                        }
                    }
                    if (count > 0) msg += String.format('總數 {0} 人', count);
                    else msg = '今日尚未有閃退紀錄'
                    message.channel.send(msg);
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }
            else if (command === '登記閃退' || command === '閃退登記') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    for (var i = 2; i < 32; i++) {
                        if (table[i][0] == userlist[message.author.id][0]) {
                            result = await gapi.fillin(String.format('C{0}', i + 1), [[true]], chlist[message.channel.id], '');
                            message.reply('已登記閃退');
                            return;
                        }
                    }
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }
	

	    else if (command === 'all' || command === '總表') {
                var tables = await gapi.getalltable(chlist[message.channel.id]);  
                var ctable = tables[0];
 		var remsg = `順序   一王   二王   三王   四王   五王 \n `
               for (i = 2; i < ctable[0].length; i++) {
                    if (ctable[1][i] ===  undefined) ctable[1][i]='NaN'
		            if (ctable[2][i] ===  undefined) ctable[2][i]='NaN'
                    if (ctable[3][i] ===  undefined) ctable[3][i]='NaN'
		            if (ctable[4][i] ===  undefined) ctable[4][i]='NaN'
		            if (ctable[5][i] ===  undefined) ctable[5][i]='NaN'
                    remsg += String.format('  {0}      {1}   {2}   {3}   {4}    {5}', ctable[0][i], ctable[1][i], ctable[2][i], ctable[3][i], ctable[4][i], ctable[5][i])
                    remsg += '\n'
                }
                message.channel.send(remsg);
		return;
            }


	    else if (command === 'one' || command === '一王'|| command === '1') {
              var tables = await gapi.getotable(chlist[message.channel.id],'一王');
                var ctable = tables[0];
                var dtable = tables[1]; //為了拿剩餘刀數 才讀傷害表
                var remsg = `No ID 剩餘  目標 ${ctable[3][0]}\n`
                for (i = 2; i < ctable[0].length; i++) {
                    remsg += String.format('{0}    {1}', ctable[0][i], ctable[1][i])
                    remsg += ' ' + await getleftknife(dtable, ctable[1][i])
                    remsg += getgroup(dtable, ctable[1][i]) != "" ? ' ' + getgroup(dtable, ctable[1][i]) : ''
                    if (ctable[2][i] === 1) remsg += ' (閃過)'
                    if (ctable[3][i] === 1) remsg += ' (已進)'
                    if (ctable[4][i]) remsg += ' 備註: ' + ctable[4][i]
                    remsg += '\n'
                }
                message.channel.send(remsg);
                return;
            }
 	   
 	   else if (command === 'two' || command === '二王'|| command === '2') {
              var tables = await gapi.getotable(chlist[message.channel.id],'二王');
                var ctable = tables[0];
                var dtable = tables[1]; //為了拿剩餘刀數 才讀傷害表
                var remsg = `No ID 剩餘  目標 ${ctable[3][0]}\n`
                for (i = 2; i < ctable[0].length; i++) {
                    remsg += String.format('{0}  {1}', ctable[0][i], ctable[1][i])
                    remsg += ' ' + await getleftknife(dtable, ctable[1][i])
                    remsg += getgroup(dtable, ctable[1][i]) != "" ? ' ' + getgroup(dtable, ctable[1][i]) : ''
                    if (ctable[2][i] === 1) remsg += ' (閃過)'
                    if (ctable[3][i] === 1) remsg += ' (已進)'
                    if (ctable[4][i]) remsg += ' 備註: ' + ctable[4][i]
                    remsg += '\n'
                }
                message.channel.send(remsg);
                return;
            }
            
            else if (command === 'three' || command === '三王'|| command === '3') {
              var tables = await gapi.getotable(chlist[message.channel.id],'三王');
                var ctable = tables[0];
                var dtable = tables[1]; //為了拿剩餘刀數 才讀傷害表
                var remsg = `No ID 剩餘  目標 ${ctable[3][0]}\n`
                for (i = 2; i < ctable[0].length; i++) {
                    remsg += String.format('{0}  {1}', ctable[0][i], ctable[1][i])
                    remsg += ' ' + await getleftknife(dtable, ctable[1][i])
                    remsg += getgroup(dtable, ctable[1][i]) != "" ? ' ' + getgroup(dtable, ctable[1][i]) : ''
                    if (ctable[2][i] === 1) remsg += ' (閃過)'
                    if (ctable[3][i] === 1) remsg += ' (已進)'
                    if (ctable[4][i]) remsg += ' 備註: ' + ctable[4][i]
                    remsg += '\n'
                }
                message.channel.send(remsg);
                return;
            }	   

	 else if (command === 'four' || command === '四王'|| command === '4') {
              var tables = await gapi.getotable(chlist[message.channel.id],'四王');
                var ctable = tables[0];
                var dtable = tables[1]; //為了拿剩餘刀數 才讀傷害表
                var remsg = `No ID 剩餘  目標 ${ctable[3][0]}\n`
                for (i = 2; i < ctable[0].length; i++) {
                    remsg += String.format('{0}  {1}', ctable[0][i], ctable[1][i])
                    remsg += ' ' + await getleftknife(dtable, ctable[1][i])
                    remsg += getgroup(dtable, ctable[1][i]) != "" ? ' ' + getgroup(dtable, ctable[1][i]) : ''
                    if (ctable[2][i] === 1) remsg += ' (閃過)'
                    if (ctable[3][i] === 1) remsg += ' (已進)'
                    if (ctable[4][i]) remsg += ' 備註: ' + ctable[4][i]
                    remsg += '\n'
                }
                message.channel.send(remsg);
                return;
            }	   
    
	  else if (command === 'five' || command === '五王'|| command === '5') {
              var tables = await gapi.getotable(chlist[message.channel.id],'五王');
                var ctable = tables[0];
                var dtable = tables[1]; //為了拿剩餘刀數 才讀傷害表
                var remsg = `No ID 剩餘  目標 ${ctable[3][0]}\n`
                for (i = 2; i < ctable[0].length; i++) {
                    remsg += String.format('{0}  {1}', ctable[0][i], ctable[1][i])
                    remsg += ' ' + await getleftknife(dtable, ctable[1][i])
                    remsg += getgroup(dtable, ctable[1][i]) != "" ? ' ' + getgroup(dtable, ctable[1][i]) : ''
                    if (ctable[2][i] === 1) remsg += ' (閃過)'
                    if (ctable[3][i] === 1) remsg += ' (已進)'
                    if (ctable[4][i]) remsg += ' 備註: ' + ctable[4][i]
                    remsg += '\n'
                }
                message.channel.send(remsg);
                return;
            }	
            
            else if (command === 'add'|| command === '報') {
                queue.push(async () => {
             var str = ''; //組合回報訊息(args)
            
                      
             
                       if (args.length < 1) {
                        message.reply('請輸入要報名的王 ex: !add 5 [訊息]').then(d_msg => { d_msg.delete(5000) });
                        return;  
                       } 
                        list  = objlist[args[0].substring(0,1)]
			        if (args.length >= 2) {
                        for (var i = 1; i < args.length; i++) {
                            str += args[i] + ' ';
                        }
                    }
 		    
                    try {
                        var tables = await gapi.getotable(chlist[message.channel.id],list);
                        memberName = userlist[message.author.id][0];
                        ctable = tables[0];
                        dtable = tables[1];
                          crashed = await getcrash(dtable, memberName);
                        if (ctable[1].indexOf(memberName) != -1) {
                            row = ctable[1].indexOf(memberName);
                            content = [[ memberName, crashed ? 1 : 0]]
                            result = await gapi.fillin(`B${row + 1}:C${row + 1}`, content, chlist[message.channel.id], list);
			                content = [[str]];
                            result = await gapi.fillin(String.format('E{0}', row + 1), content, chlist[message.channel.id], list);
                            message.reply('已在班表中,更新回覆訊息').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }
                   
                        //取閃退狀態
                        dtable = tables[1];
                        row = ctable[0].length - 1; //插入位置
                        content = [[row, memberName, crashed ? 1 : 0,0]]
                        //TODO: 取剩餘刀數
                        result = await gapi.fillin(`A${row + 2}:D${row + 2}`, content, chlist[message.channel.id], list);
			            content = [[str]];
                        result = await gapi.fillin(String.format('E{0}', row + 2), content, chlist[message.channel.id], list);
                        message.reply('報刀成功,你的編號是' + row).then(d_msg => { d_msg.delete(5000) });
				
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        console.log(err)
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                    return ;
                })
                return;
            }

            else if (command === 'addfor'|| command === '代報') {
                queue.push(async () => {
             var str = ''; //組合回報訊息(args)

                        if (args.length <= 1) {
                              message.reply('請輸入要報名的王 ex: !addfor @成員 5 [訊息]').then(d_msg => { d_msg.delete(5000) });
                              return;  
                           } 
            
                       list  = objlist[args[1].substring(0,1)]

                       var memberid = args[0].replace(/[^0-9\.]+/g, '');
                        if (!(memberid in userlist)) {
                            message.reply('錯誤的成員名稱!').then(d_msg => { d_msg.delete(5000) });
                              return;  
                        }
                               
			 if (args.length >= 3) {
                        for (var i = 2; i < args.length; i++) {
                            str += args[i] + ' ';
                        }
                    }
                    var tables = await gapi.getotable(chlist[message.channel.id],list);
                    memberName = userlist[memberid][0];
                    dtable = tables[1];
                    crashed = await getcrash(dtable, memberName);
                    try {
                        
                        ctable = tables[0];
                        if (ctable[1].indexOf(memberName) != -1) {
                            row = ctable[1].indexOf(memberName);
                            content = [[ memberName, crashed ? 1 : 0]]
                            result = await gapi.fillin(`B${row + 1}:C${row + 1}`, content, chlist[message.channel.id], list);
			                content = [[str]];
                            result = await gapi.fillin(String.format('E{0}', row + 1), content, chlist[message.channel.id], list);
                            message.reply('已在班表中,更新回覆訊息').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }
                        //取閃退狀態
                        dtable = tables[1];
                        row = ctable[0].length - 1; //插入位置
                        content = [[row, memberName, crashed ? 1 : 0,0]]
                        //TODO: 取剩餘刀數
                        result = await gapi.fillin(`A${row + 2}:D${row + 2}`, content, chlist[message.channel.id], list);
			            content = [[str]];
                        result = await gapi.fillin(String.format('E{0}', row + 2), content, chlist[message.channel.id], list);
                        message.reply('報刀成功,你的編號是' + row).then(d_msg => { d_msg.delete(5000) });
				
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        console.log(err)
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                    return ;
                })
                return;
            }

            else if (command === 'call'||command === '叫') {
                queue.push(async () => {
                    try {
                        if (args.length != 1) {
                            message.channel.send('請輸入要呼叫的王 ex: !call 5');
                            return;  
                           }   
                           var  list  = objlist[args[0].substring(0,1)]
                        var tables = await gapi.getotable(chlist[message.channel.id],list);
                            ctable = tables[0];
                            var msg='要打'+list+'的出刀囉~~';
                            rowl = ctable[0].length;
                            for (var i = 2; i < rowl; i++) {
                                code=usercode[ctable[1][i]][0]; 
                              msg += String.format('<@!{0}>', code);
                            }
                            
                            message.channel.send(msg);
                            return;
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        console.log(err)
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                    return ;
                })
                return;
            }


            else if (command === 'del' || command === '收回' ) {
                queue.push(async () => {
                    try {
                        if (args.length != 1) {
                            message.channel.send('請輸入要收回的王 ex: !del 5');
                            return;
                        }

                        var list  = objlist[args[0].substring(0,1)]
                        //var oldctable = await gapi.getotablebyRow(chlist[message.channel.id],list);
                        var tables = await gapi.getotable(chlist[message.channel.id],list);
                        memberName = userlist[message.author.id][0];
                        ctable = tables[0];
                        row = ctable[1].indexOf(memberName);
                        rowl = ctable[0].length;
                        leng=rowl-row
                        noe =[['','', '','','']]

                        if (row < 0) {
                            message.reply('已不在刀表中。').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }

                    if(row===rowl ){
                        let resultt = await gapi.fillin(`A${row+1}:E${row+1}`, noe, chlist[message.channel.id], list);
                        message.reply('已刪除完畢').then(d_msg => { d_msg.delete(5000) });
                        return;
                       }
                       else if (row!=rowl){
                        for (i = row+1 ; i < rowl; i++) {
                            bk = [[ctable[1][i], ctable[2][i], ctable[3][i], ctable[4][i]]] 
                            result = await gapi.fillin(`B${i}:E${i}`, bk , chlist[message.channel.id], list);
                         }
                         let resultt = await gapi.fillin(`A${rowl}:E${rowl}`, noe, chlist[message.channel.id], list);
                         message.reply('已刪除完畢').then(d_msg => { d_msg.delete(5000) });
                        // message.channel.send(`<@&${tag}> ${target}`)
                        }
                        
                    }
                    catch (err) {
                        console.log(err)
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                })
                return;
            }

            else if (command === 'delfor' || command === '代刪' ) {
                queue.push(async () => {

                    try {
                        var memberid = args[0].replace(/[^0-9\.]+/g, '');
                        if (!(memberid in userlist)) {
                            throw new Error('錯誤的成員名稱!');
                        }


                        if (args.length != 2) {
                            message.channel.send('請輸入要收回的王 ex: !delfor @成員 5');
                            return;
                        }

                        var list  = objlist[args[1].substring(0,1)]
                       // var oldctable = await gapi.getotablebyRow(chlist[message.channel.id],list);
                        var tables = await gapi.getotable(chlist[message.channel.id],list);
                        memberName = userlist[memberid][0];
                        ctable = tables[0];
                        row = ctable[1].indexOf(memberName);
                        rowl = ctable[0].length;
                        leng=rowl-row
                        noe =[['','', '','','']]
                        
                        if (row < 0) {
                            message.reply('已不在刀表中。').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }

                       if(row===rowl ){
                        let resultt = await gapi.fillin(`A${row+1}:E${row+1}`, noe, chlist[message.channel.id], list);
                        message.reply('已刪除完畢').then(d_msg => { d_msg.delete(5000) });
                        return;
                       }
                       else if (row!=rowl){
                        for (i = row+1 ; i < rowl; i++) {
                            bk = [[ctable[1][i], ctable[2][i], ctable[3][i], ctable[4][i]]] 
                            result = await gapi.fillin(`B${i}:E${i}`, bk , chlist[message.channel.id], list);
                         }
                         let resultt = await gapi.fillin(`A${rowl}:E${rowl}`, noe, chlist[message.channel.id], list);
                         message.reply('已刪除完畢').then(d_msg => { d_msg.delete(5000) });
                        // message.channel.send(`<@&${tag}> ${target}`)
                        }
                    }
                    catch (err) {
                        console.log(err)
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                })
                return;
            }

            

            else if (command === '清除' || command === 'clear') {
                queue.push(async () => {
			

                    try {
                        if (args.length != 1) {
                            message.channel.send('請輸入要清除的列表 ex: !清除 一王');
                            return;
                        }
                        //get args
                        var target = objlist[args[0].substring(0,1)]
                        //backup
                        var oldctable = await gapi.getotablebyRow(chlist[message.channel.id],target);
                        var bk_table = [...Array(30)].map(x => Array(4).fill(''))
                        for (i = 0; i < oldctable.length; i++) {
                            for (j = 0; j < oldctable[i].length; j++)
                                bk_table[i][j] = oldctable[i][j]
                        }
                        backupresult = await gapi.fillin('A33:E62', bk_table, chlist[message.channel.id], target);
                        //write
                        let firstrow = ['', '', '目標', target]
                        let secondrow = ['順序', '成員名稱', '今日已閃', '進場', '回報訊息(傷害)']
                        let matrix = [...Array(29)].map(x => Array(5).fill(''))
                        matrix = [firstrow, secondrow, ...matrix]
                        let result = await gapi.fillin('A1:E31', matrix, chlist[message.channel.id], target);
                        message.channel.send('班表已重置 ').then(d_msg => { d_msg.delete(5000) });
                        // message.channel.send(`<@&${tag}> ${target}`)
                    }

		catch (err) {
                        console.log(err)
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                })
                return;
            }
 
            else if (command === '回復' || command === 'recover') {
                //recover
                queue.push(async () => {

                    try {
                        if (args.length != 1) {
                            message.channel.send('請輸入要回復的列表 ex: !回復 1');
                            return;}

                        var target = objlist[args[0].substring(0,1)]
                        //get bk table
                        var oldctable = await gapi.getBKCollectingtable(chlist[message.channel.id],target);
                        var bk_table = [...Array(31)].map(x => Array(5).fill(''))
                        for (i = 0; i < oldctable.length; i++) {
                            for (j = 0; j < oldctable[i].length; j++)
                                bk_table[i][j] = oldctable[i][j]
                        }
                        result = await gapi.fillin('A1:E31', bk_table, chlist[message.channel.id], target);
                        message.channel.send('指定刀表已回復')
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        console.log(err)
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                })
                return;
            }
            
          
         
            else if (command === '進場' || command === '進'|| command === 'go') {
                queue.push(async () => {
                    try {
                        if (args.length != 1) {
                            message.channel.send('請輸入要進場的王 ex: !進 1 ');
                            return;
                        }
                        list  = objlist[args[0].substring(0,1)]
                        var tables = await gapi.getotable(chlist[message.channel.id],list );
                        memberName = userlist[message.author.id][0];
                        ctable = tables[0];
                        row = ctable[1].indexOf(memberName) //呼叫者所在row
                        if (row < 0) {
                            message.reply('不在刀表中。').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }
                        var doublecall = false; //檢查是否重複呼叫
                        if (ctable[3][row] === 1) {
                            doublecall = true;
                        }
                        var mancount = ctable[0].length - 2; //因會算到tittle
                        var entercount = 0; //已進場人數
                        ctable[3].forEach(function (x) { if (x === 1) entercount += 1 });
                        if (!doublecall) entercount += 1; //如果未重複呼叫 進場人數要加上自己
                        count = mancount - entercount; //未進人數
                        content = [[1]]
                        result = await gapi.fillin(String.format('D{0}', row + 1), content, chlist[message.channel.id], list);
                        var msg = '';
                        if (count > 0) msg += String.format('{0} 已進場\n還有 {1} 個成員還沒進場', memberName, count);
                        else msg += String.format('{0} 已進場\n所有成員已全數進場', memberName);
                        message.reply(msg).then(d_msg => { d_msg.delete(5000) });
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content);
                        console.log(err);
                        message.reply('錯誤訊息: ' + err.message);
                       
                    }
                })
                return;
            }


            else if (command === '退' || command === '退刀'|| command === 'back') {
                queue.push(async () => {
                    try {
                        if (args.length != 1) {
                            message.channel.send('請輸入要退刀的王 ex: !back 1 || 集刀請打 !back 0 ');
                            return;
                        }
                        list  = objlist[args[0].substring(0,1)]
                        var tables = await gapi.getotable(chlist[message.channel.id],list );
                        memberName = userlist[message.author.id][0];
                        ctable = tables[0];
                        row = ctable[1].indexOf(memberName) //呼叫者所在row
                        content = [[0]]
                        content1 = [['']];
                            var msg='在'+list+'的可以出來了，訊息已清空，成功人士記得更新補償秒數or刪表';
                            rowl = ctable[0].length;
                            for (var i = 2; i < rowl+1; i++) {

                             if (ctable[3][i] === 1 )
                             {
                                code=usercode[ctable[1][i]][0]; 
                                msg += String.format('<@!{0}>', code);
                                result = await gapi.fillin(String.format('D{0}', i + 1), content, chlist[message.channel.id], list); 
                                result1 = await gapi.fillin(String.format('E{0}', i + 1), content1 , chlist[message.channel.id],list);
                            }
                            }
                            message.channel.send(msg);
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content);
                        console.log(err);
                        message.reply('錯誤訊息: ' + err.message);
                        
                    }
                })
                return;
            }


else if (command === '報刀說明') {

    var embed = {
        "title": "報刀功能說明",
        "description": "本功能與傷害紀錄表中的分頁連動，若有換人需求可至排刀表手動修改\n本功能也可用於出刀報數，方便統計報名者，並隨時查看名單", /******************* */
        "color": 1500903,
        "fields": [
            {
                "name": "<!add 1 [回報訊息(傷害)]>或<!報 1 [回報訊息(傷害)]>",
                "value": "報名一王並登記傷害，add 2~add 5 2~5王指令  EX:!add 1 500W\n重複指令可覆蓋訊息"
            },
            {
                "name": "<!addfor @成員 1 [回報訊息(傷害)]>或<!代報  @成員1 [回報訊息(傷害)]>",
                "value": "代替@成員報名一王並登記傷害，add 2~add 5 2~5王指令  EX:!add 1 500W\n重複指令可覆蓋訊息"
            },
            {
                "name": "<!進 1> 或 <!go 1>",
                "value": "登記進場 1王"
            },

            {
                "name": "<!退 1> 或 <!back 1>",
                "value": "王死退刀，取消所有人進場狀態 "
            },
            {
                "name": "<!all> 或 <!總表>",
                "value": "查看各王報名狀況(預設前9位)"
            },
                                    
            {
                "name": "<!1> 或<!one> 或 <!一王>",
                "value": "查看一王報名人員清單和回報傷害，二王指令 !二王/two/2"
            },
            {
                "name": "<!call 1> 或 <!叫 1>",
                "value": "呼叫報名一王的成員"
            },
            {
                "name": "<!del 1> 或 <!收回 1>",
                "value": "刪除/收回 1王的報名列表"
            },
            {
                "name": "<!delfor @成員 1> 或 <!代刪 @成員 1>",
                "value": "幫 @成員 刪除/收回 1王的報名列表"
            },
            {
                "name": "<!清除 1> 或<!clear 1>",
                "value": "重置指定班表 "
            },
            {
                "name": "<!回復 1> 或<!recover 1>",
                "value": "回復上次重整前備份名單"
            },

            
                                                       ]
    };
    message.channel.send({ embed });
    return;
        }
         
        }
        /*****大眾功能*****/

        if (command === 'help' || command === '說明') {
            var embed = {
                "title": "使用說明書",
                "description": "",
                "color": 1500903,
                "timestamp": "2019-12-21T02:02:33.417Z",
                "image": {
                    //"url": "https://media.discordapp.net/attachments/700695816645378078/705445458150948975/6c119f4cc1db7481.jpg?width=356&height=498" //takagi https://imgur.com/dEBTCu6.jpg
                                  "url": "https://cdn.discordapp.com/attachments/114664019591168003/691677696438304809/image0-3.jpg" 
                }, 
                "author": {
                    "name": "可畏",
                    "icon_url": "https://media.discordapp.net/attachments/114664019591168003/691699780732059668/1572244699104.jpg?width=303&height=498" //https://imgur.com/fozYyuU.jpg
                },
                "fields": [
                    {
                        "name": "<!fill 傷害 目標> 或 <!填表 傷害 目標>",
                        "value": "為呼叫者填傷害，目標用12345或一二三四五都可以。ex: !fill 2000000 3"
                    },
                    {
                        "name": "<!fill 傷害 目標 尾刀/殘刀> 或 <!填表 傷害 目標 尾刀/殘刀>",
                        "value": "若是尾刀或補償刀(殘刀)，只要在最後加註尾或殘即可。ex: !fill 2000000 五 殘；在尾刀有勾的情況下，下次填表都會自動當成殘刀"
                    },
                    {
                        "name": "<!fillfor @成員 傷害 目標 (尾/殘)> 或 <!代填 @成員 傷害 目標 (尾/殘)>",
                        "value": "可幫tag的團員填傷害 ex: !fillfor @蒼蘭 7777777"
                    },
                    {
                        "name": "<!status> 或 <!status @成員>",
                        "value": "查看呼叫者或某成員當日傷害紀錄"
                    },
                    {
                        "name": "<!remind>",
                        "value": "查看該頻道公會當日剩餘刀數"
                    },
                    {
                        "name": "<!查刀>",
                        "value": "查看該頻道公會每人所剩刀數和已輸出的目標"
                    },
                    {
                        "name": "<!閃退> 或 <!crashlist>",
                        "value": "查看該頻道公會當日閃退人員清單"
                    },
                    {
                        "name": "<!登記閃退> 或 <!閃退登記>",
                        "value": "登記呼叫者當日閃退"
                    },
                    {
                        "name": "<!url> 或<!表單>",
                        "value": "查看該頻道公會的傷害紀錄表"
                    },
                    {
                        "name": "<!報刀說明>",
                        "value": "取得詳細報刀指令"
                    },
                    
                ]
            };
            message.channel.send({ embed });
        }
        else if (command === 'reload') {
            try {
                userlist = {};
                usercode = {};
                for (i in ssidlist) {
                    var ul = await gapi.getUserList(ssidlist[i]);
                    for (var j in ul) {
                        userlist[ul[j][1]] = [ul[j][0], ssidlist[i]];
                        usercode[ul[j][0]] = [ul[j][1], ssidlist[i]];
                    }
                }
                console.log(userlist);
                message.channel.send('已重新讀取成員名單')
            }
            catch (err) {
                console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                console.log(err)
                message.reply('錯誤訊息: ' + err.message);
            }
            return;
        }
        else {
            otherreply(message, command, args);
        }


    }

});


client.login(token);

/***************************************/


async function statusandreply(message, memberid) {
    try {
        memberName = userlist[memberid][0];
        var table = await gapi.getDemageTable(chlist[message.channel.id]); //取得當天排刀表 userlist[memberid][1]
        var status = await getstatus(table, memberName);
        // console.log(status) //obj

        var repmsg = {
            "embed":
            {
                "title": memberName + " 今日狀態",
                "color": 5301186,
                "fields": status
            }
        };
        // console.log(repmsg) //obj

        message.reply(repmsg);
    }
    catch (err) {
        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
        console.log(err)
        message.reply('錯誤訊息: ' + err.message);
    }
}


async function fillandreply(message, memberid, demage, object, ps) {
    try {
        if (object == '') {
            message.reply('請填寫輸出目標。ex: !fill 1234567 1');
            return;
        }
        memberName = userlist[memberid][0];
        var table = await gapi.getDemageTable(chlist[message.channel.id]);
        var former_status = await getstatus(table, memberName);

        await fillindemage(message, table, memberid, demage, object, ps);

        var table2 = await gapi.getDemageTable(chlist[message.channel.id]);
        var latter_status = await getstatus(table2, memberName);


        var repmsg = {
            "embed":
            {
                "title": memberName + " 今日狀態已更新為:",
                "color": 5301186,
                "fields": latter_status
            }
        };

        message.reply(repmsg);
    }
    catch (err) {
        console.log(err.message + ' : ' + message.author.username + ':' + message.content);
        if (err.message == 'no fillable cell') {
            var embed = {
                "title": memberName + " 今日狀態",
                "color": 5301186,
                "fields": former_status
            };
            message.reply("找不到可填的欄位!", { embed });
        }
        else {
            message.reply('錯誤訊息: ' + err.message);
        }
    }
}

async function fillindemage(message, table, memberid, demage, object, ps) {
    return new Promise(async function (resolve, reject) {
        try {
            memberName = userlist[memberid][0];
            row = 0;
            for (var i = 0; i < table.length; i++) {
                if (table[i][0] == memberName) row = i
            }

            //先找有勾尾且還沒有殘刀傷害的
            for (var j = 5; j < table[1].length; j += 5) {
                if (table[row][j] == true) {
                    if (table[row][j + 1] == '' || typeof table[row][j + 1] === 'undefined') { //尾刀打勾且殘刀傷害空白
                        result = await gapi.fillin(column[j + 1] + (row + 1), [[demage]], chlist[message.channel.id], '');
                        if (object != '') {
                            result = await gapi.fillin(column[j + 2] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                        }
                        resolve(result);
                        return;
                    }
                }
            }

            // console.log(table)
            //再來找沒勾尾 但有ps殘的 -> 找殘刀傷害空白 且下一隊傷害空白
            if (ps === '殘') {
                for (var j = 6; j < table[1].length; j += 5) {
                    if (table[row][j] == '' || isNaN(table[row][j])) { //殘刀傷害空白
                        if (j + 2 >= table[row].length) {
                            result = await gapi.fillin(column[j] + (row + 1), [[demage]], chlist[message.channel.id], '');
                            if (object != '') {
                                result = await gapi.fillin(column[j + 1] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                            }
                            resolve(result);
                            return;
                        }
                        else {
                            if (table[row][j + 2] == '') {//下一隊傷害空白
                                result = await gapi.fillin(column[j] + (row + 1), [[demage]], chlist[message.channel.id], '');
                                if (object != '') {
                                    result = await gapi.fillin(column[j + 1] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                                }
                                resolve(result);
                                return;
                            }
                        }

                    }
                }
                throw new Error('無尾刀紀錄或是殘刀傷害已填')////

            }
            else {
                for (var j = 3; j < table[1].length; j += 5) {
                    if (table[row][j] == '') { //如果傷害空白
                        result = await gapi.fillin(column[j] + (row + 1), [[demage]], chlist[message.channel.id], '');
                        if (ps === '尾') {
                            result = await gapi.fillin(column[j + 2] + (row + 1), [[true]], chlist[message.channel.id], '');
                        }
                        if (object != '') {
                            result = await gapi.fillin(column[j + 1] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                        }
                        resolve(result);
                        return;
                    }
                }
                throw new Error('no fillable cell');
            }
        }
        catch (err) {
            // console.log(err);
            reject(err);
        }
    })
}

function getstatus(table, memberName) {
    return new Promise(function (resolve, reject) {
        row = 0;
        for (var j = 0; j < table.length; j++) {
            if (table[j][0] == memberName) row = j
        }
        sta = [
            {
                "name": "閃退",
                "value": table[row][2] ? '已用' : '未用'
		
		    		
		            }
        ]
	 sta.push({
                    "name": "剩餘刀數",
                    "value": table[row][1],
                })

        //加入本刀傷害
        for (var j = 3; j <= 13; j += 5) {
            if (table[row][j] > 0) {
                sta.push({
                    "name": table[0][j],
                    "value": table[row][j] + ' ' + table[row][j + 1] + ' ' + (table[row][j + 2] ? '尾' : ''),
                    "inline": true
                })
            }
        }
        // console.log(table[row].length)
        //加殘刀傷害
        for (var j = 6; j <= 16; j += 5) {
            if (table[row][j] > 0) {
                sta.push({
                    "name": table[0][j - 3] + " 殘刀",
                    "value": table[row][j] + ' ' + table[row][j + 1],
                    "inline": true
                })
            }
        }

        resolve(sta);
    })
}

function getcrash(table, memberName) {
    return new Promise(function (resolve, reject) {
        var crash = false; //boss team demage
        for (var j = 0; j < table.length; j++) {
            if (table[j][0] == memberName) {
                crash = table[j][2]
            }
        }
        resolve(crash);
    })
}

function getleftknife(table, memberName) {
    var leftknife = "";
    for (var j = 0; j < table.length; j++) {
        if (table[j][0] == memberName) {
            if (table[j][18] == "v")
                leftknife += "殘+"
            leftknife += table[j][1] + "刀"

        }
    }
    // console.log(leftknife)
    return (leftknife);
}

function getgroup(table, memberName) {
    var group = "";
    for (var j = 0; j < table.length; j++) {
        if (table[j][0] == memberName) {
            if (typeof table[j][19] != 'undefined') {
                // console.log(table[j][19])
                group += table[j][19] + "組"
            }
        }
    }
    return group;
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}

function callefttime(baselinehour) {
    var now = new Date();

    year = now.getFullYear();
    month = now.getMonth();
    date = now.getDate();
    hour = now.getHours();
    if (hour > 5) date = date + 1;
    var deadline = new Date(year, month, date, baselinehour)
    var substract = new Date(deadline - now)

    return (Math.floor(substract.getTime() / 3600000) + "小時" + substract.getUTCMinutes() + "分" + substract.getUTCSeconds() + "秒");
}


/*function otherreply(message, command, args) {

    if (command === 'dance') {

	 var embed = {
	 "image": {
                    "url": "https://media.discordapp.net/attachments/700695816645378078/705445458150948975/6c119f4cc1db7481.jpg?width=356&height=498" 
                  
                },}
		message.channel.send({ embed });
	        return

    }

    else if(command === '黎明卿'|| command === '爆死'|| command === '救'|| command === '我愛黎明'){
        message.reply('素晴らしい' );
        return
    }
   else {
        
        return;

    }
}  */

function replyimagefrom(message, command, path) {
    var fs = require('fs');
    var files = fs.readdirSync(path);
    files = files.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
    var n = 0;
    var found = false;
    for (i = 0; i < files.length; i++) {
        if (files[i].toLowerCase().indexOf(command) != -1) {
            n = i;
            found = true;
            break;
        }
    }
    if (!found)
        n = Math.floor(Math.random() * files.length);
    message.channel.send({
        files: [
            path + files[n],
        ]
    });
}