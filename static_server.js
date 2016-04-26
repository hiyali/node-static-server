/* v1.6
 v1.6 - elalashturuldi, aptomatik lan ip (host) (优化log与自动获取本地IP-无需手动输入了)
 v1.5 - eniq(qizil) korunidighan isimlar (自定义红色文本)
 v1.4 - IP tosush qoshuldi (加入禁止IP列表) 
 v1.3 - elalashturuldi (优化) 
 v1.2 - ereb-xenzu hojjet-qisquch namini qollaydu (支持阿拉伯文、中文 路径、文件名) 
 v1.1 - bala hojjetqisquch qoshqili bolidu (支持子目录)
 
Salam addi mulazimiti - 本地监听端口服务
author: salam
email: Salam.14@163.com
2014.8.11 created , at otkurbiz company in urumchi.
*/

/* 

* ishlitish - 使用方式

node listen.js

Mulazimet qozghanlghandin keyin LAN ichide bu adresni ziyaret qilalaysiz
 - 服务启动后，可以直接在LAN内访问该地址了。

* muhit - 环境 
NodeJS
urlencode (NodeJS Module)

*/

var http = require("http"), //http
	url = require("url"), //url
	path = require("path"), //address
	fs = require("fs"), //hojjet
	os = require("os"), //sestima
	urlencode = require('urlencode'); //shifirlash

//console.info(getAll(os.networkInterfaces()));

/*for u*/
var host = getLocalIP(), //your LAN address (example: "192.168.0.131" )
	port = 5555, //port number (example: 1234)
	addYour = "/html", //ichidiki qaysi address?  (example: /web)
	stopIP = ['stop Ip input here', '202.101.1.'], //tosulidighan IP lar  (example: 192.168.1.)
	impNAME = ['Here enter the text you need to become red', 'index.html', 'bashbet', 'web']; //eniq korunidighan isimlar (example: index.html)

var hostname = "http://" + host + ":" + port;

/*for Log*/
var lastIP = "",
	first = true,
	reqCount = 0,
	stopCount = 0;

http.createServer(function(req, res) {

	/*for Log*/
	var kimIP = req.connection.remoteAddress || 'unkown';

	if (kimIP != lastIP) {
		if (first) {
			//console.info('time: ' + formatDate());
			first = false;
		} else {
			console.log('}        --- Axirlashti --- ');
		}

		reqCount = 0;
		//stopCount=0;  //peqet bir;

		console.log(' ');
		console.log(kimIP + " Request Headers" + getReqHeaders(req) + req.method + ' { ');
	}
	lastIP = kimIP;
	/*for Log end*/

	var pathname = urlencode.decode( /*__dirname+*/ url.parse(req.url).pathname); //utf-8 ge aylandurimiz

	if (forAinB(kimIP, stopIP)) { //tosalghan IP lar
		console.log(++stopCount + " : " + " request tosaldi!");

		res.writeHead(404, {
			"Content-Type": "text/html;charset=utf-8"
		});
		res.write("<h1 style='font-family:Microsoft Uighur' title='Salam sanji'>كۆرمە بۇلارنى</h1>");
		res.end("<a href='" + '' + "''>Home</a>");
		return;
	}

	//bashqa IP lar

	if (pathname.charAt(pathname.length - 1) == "/" || path.extname(pathname) <= 0) { //hojjet qisquch
		/*
		fs.mkdir(路径,权限mode/777,回调函数);    
		fs.rmdir(路径,回调函数);    
		fs.readdir(路径,回调函数(err,fileNameArray));
		fs.stat(文件路径,回调函数(err,fs.Stats对象)); 
		/**/

		fs.readdir(__dirname + addYour + pathname, function(err, fileNameArray) {

			if (err) {
				haveERR(err, res, hostname);
			} else {
				var pathnameTemp = pathname;
				var isRED;

				res.writeHead(200, {
					"Content-Type": "text/html;charset=utf-8"
				});

				for (var i = 0; i < fileNameArray.length; i++) {
					if (fileNameArray[i].charAt(0) == ".") continue; //aldida chekiti bar hojjetni korsetmeymiz.

					if (pathnameTemp.charAt(pathnameTemp.length - 1) != "/")
						pathnameTemp += "/";

					isRED = forAinB(fileNameArray[i], impNAME) ? 'color:red' : ''; //qizil xet uchun

					res.write("<a style='" + isRED + "' href='" + '' + pathnameTemp + fileNameArray[i] + "'>" + fileNameArray[i] + "</a><br/>");

				};

				res.end("<br/><a href='" + '' + "''>Home</a>");
			}
		});
	} else { //hojjet
		haveOPEN(__dirname + addYour + pathname, res, hostname);

	} //hojjet qisquchmu hojjetmu?

	if (reqCount != 0)
		if (reqCount % 50 == 0.0) //kop qetim korse, tekshurushke paydiliq.
			console.info('( ' + kimIP + ' ... - ' + formatDate() + ' )')
		else if (reqCount % 10 == 0.0) //waqit
		console.info('( ' + formatDate('h:i:s') + ' )');

	console.log(' ' + ++reqCount + ' : ' + pathname); //hazir 'request' qilinghan hojjet

}).listen(port, host);

function haveERR(err, res, hostname) {
	res.writeHead(400, {
		"Content-Type": "text/html;charset=utf-8"
	});
	res.write("<h1 title='Salam sanji'>خاتالىق كۆرۈلدى...</h1>");
	res.write("<pre>" + err + "</pre>");
	res.end("<a href='" + '' + "''>Home</a>");
}

function readFile(MYpath, res, hostname) {
	//console.log(res + " / " + hostname); //res is a lot of line file

	fs.readFile(MYpath, function(err, data) {
		if (err) {
			haveERR(err, res, hostname);
		}
		res.end(data);
		//res.end("<a href='"+hostname+"''>Home</a>");
	});
}

function forAinB(A, B) {
	for (var i = 0; i < B.length; i++)
		if (A == B[i])
			return true;
	return false;
}

function getReqHeaders(req) {
	var str = " { \n",
		obj = req.headers;

	str += ' - Request time : ' + formatDate() + '\n';

	for (var a in obj) {
		str += " - " + a + " : " + obj[a] + '\n';
	}
	return str + " } ";
}

function haveOPEN(MYpath, res, hostname) {

	//console.log(MYpath);
	fs.exists(MYpath, function(exists) {

		if (exists) {
			//hojjet bolsa
			switch (path.extname(MYpath)) {
				case ".html":
					res.writeHead(200, {
						"Content-Type": "text/html;charset=utf-8"
					});
					break;
				case ".js":
					res.writeHead(200, {
						"Content-Type": "text/javascript"
					});
					break;
				case ".css":
					res.writeHead(200, {
						"Content-Type": "text/css"
					});
					break;
				case ".txt":
					res.writeHead(200, {
						"Content-Type": "text/txt"
					});
					break;
				case ".gif":
					res.writeHead(200, {
						"Content-Type": "image/gif"
					});
					break;
				case ".jpg":
					res.writeHead(200, {
						"Content-Type": "image/jpeg"
					});
					break;
				case ".png":
					res.writeHead(200, {
						"Content-Type": "image/png"
					});
					break;
				default:
					res.writeHead(200, {
						"Content-Type": "application/octet-stream"
					});
			}

			readFile(MYpath, res, hostname);

		} else {
			//hojjet bolmisa
			res.writeHead(404, {
				"Content-Type": "text/html;charset=utf-8"
			});
			res.write("<h1 title='Salam sanji'>404 بەت تېپىلمىدى...</h1>");
			res.end("<a href='" + '' + "''>Home</a>");
			return;
		} //hojjet bolmisa
	});
}

function getLocalIP() {
	var ifaces = os.networkInterfaces(),
		map = [];

	for (var dev in ifaces) {
		for (var key in dev) {
			try {
				if (ifaces[dev][key].family.indexOf('IPv4') != -1 && ifaces[dev][key].address.indexOf('127.0.0.1') == -1) //IPv4地址
					return ifaces[dev][key].address;
			} catch (e) {
				console.log(e);
			}
		}
	}
	return map;
}

/*function getAll(obj){  //全部遍历
//无线网络连接 5    -    1     -   address  (family = IPv4)
var props = "";
for ( var p in obj ){ // 方法 
if ( typeof ( obj [ p ]) == "object" ){  //function
props += obj [ p ] + "("+p+")" + "= [ " +getAll( obj [ p ] ) + " ] \n";//obj [ p ]() ; 
} else { // p 为属性名称，obj[p]为对应属性的值 
props += p + " = " + obj [ p ] + " \t " ; 
} 
} // 最后显示所有的属性 
return props;
}//*/

function formatDate(formatStr, date) {
	var fTime, fStr = 'ymdhis';

	if (!formatStr) formatStr = "y-m-d h:i:s";
	else formatStr = formatStr.toString();

	if (date) fTime = new Date(date);
	else fTime = new Date();

	var formatArr = [
			fTime.getFullYear().toString(), (fTime.getMonth() + 1).toString(),
			fTime.getDate().toString(),
			fTime.getHours().toString(),
			fTime.getMinutes().toString(),
			fTime.getSeconds().toString()
		]
		/*
		var time1 = Date.parse(new Date()),  
		time2 = (new Date()).valueOf(),  
		time3 = new Date().getTime(); 
		*/

	for (var i = 0; i < formatArr.length; i++) {
		formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
	}

	return formatStr;
}

console.info(
	//service info
	"\nSalam Mulazimiti Qozghaldi : " + hostname + "/" + '\n - Start time : ' + formatDate()

	//author info
	+ '\n ' + '\n - author : Salam Sanji' + '\n   email : Salam.14@163.com' + '\n '
);

console.log( //yerliktiki uchurlar
	'::::::::::Info::::::::::' + '\n - Address : ' + __dirname + addYour + '  \n - temp dir : ' + os.tmpdir() + '  \n - endianness : ' + os.endianness() + '  \n - host name : ' + os.hostname() + '  \n - type : ' + os.type() + '  \n - platform : ' + os.platform() + '  \n - arch : ' + os.arch() + '  \n - release : ' + os.release() + '  \n - system uptime : ' + os.uptime() + " (s)" + '\n'
);

/*for u end*/
