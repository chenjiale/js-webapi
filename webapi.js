//接口鉴权chenjl
var APIKey = "1111"
var apiSecret ="1111111"
var host="host: ws-api.xfyun.cn"
var date=new Date().toGMTString()//日期必须是这个格式
var request_line="GET /v2/iat HTTP/1.1"
var signature_origin = host+"\n"+"date: "+date+"\n"+request_line
signature_sha=CryptoJS_xm.HmacSHA256(signature_origin,apiSecret)//CryptoJS来自CryptoJS v3.1的hmac-sha256.js，去百度上下吧
signature=CryptoJS.enc.Base64.stringify(signature_sha)
authorization_origin ='api_key="'+APIKey+'", algorithm="hmac-sha256", headers="host date request-line", signature="'+signature+'"'
authorization = window.btoa(authorization_origin)
ws="wss://ws-api.xfyun.cn/v2/iat?authorization="+authorization+"&date="+date+"&host=ws-api.xfyun.cn"
var ws = new WebSocket(ws);
ws.onerror=function(data){
  console.log("失败")
}
ws.onopen=function(evt){
	console.log("打开链接了")
}
ws.onmessage=function(evt){
	console.log(evt.data)
}
//以上贴到浏览器控制台就OK,前提是你要引入CryptoJS v3.1的hmac-sha256.js


var reader = new FileReader();
function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}
reader.onload = function(e) {
	var buffer=e.target.result;
	var bufferArray=Array.from(new Int8Array(buffer))
	var audioData = bufferArray.splice(0,122*8)
	//bufferArray就是音频文件的字节数组，你要传的音频数据，因为我们格式m4a，科大不支持所以不写了
	var firstFrame={
		"common":{
			"app_id":"5d19c6cb"
		},
		"business":{
			"language":"zh_cn",
			"domain":"iat",
			"accent":"mandarin",
		},
		"data":{
			"status":0,
			"format":"audio/L16;rate=16000",
			"encoding":"raw",
			"audio":arrayBufferToBase64(audioData)
		}
	}
	//第一帧
	ws.send(JSON.stringify(firstFrame))
	var handler=setInterval(function(){
		//最后一帧
		if(bufferArray.length==0){
			ws.send(JSON.stringify({"data":{
				"status":2,
				"format":"audio/L16;rate=16000",
				"encoding":"raw",
				"audio":""
			}}))
			clearInterval(handler)
			return
		}
		audioData = bufferArray.splice(0,122*8)
		//中间帧
		ws.send(JSON.stringify({"data":{
			"status":0,
			"format":"audio/L16;rate=16000",
			"encoding":"raw",
			"audio":arrayBufferToBase64(audioData)
		}}))
	},40)
}
reader.readAsArrayBuffer(file)//file是blob对象
