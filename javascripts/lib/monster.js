/*!
  * Cookie Monster - A javascript cookie library
  * v0.0.2
  * https://github.com/jgallen23/cookie-monster
  * copyright JGA 2011
  * MIT License
  */
!function(a,b){typeof module!="undefined"&&module.exports?module.exports=b():typeof define=="function"&&typeof define.amd=="object"?define(b):this[a]=b()}("monster",function(){var a=function(){return{set:function(a,b,c,d){var e=new Date,f="",g=typeof b,h="";d=d||"/",c&&(e.setTime(e.getTime()+c*24*60*60*1e3),f="; expires="+e.toGMTString());if(g!=="string"&&g!=="undefined")if("JSON"in window)h=JSON.stringify({v:b});else throw"Bummer, your browser doesn't support JSON parsing.";else h=escape(b);document.cookie=a+"="+h+f+"; path="+d},get:function(a){var b=a+"=",c=document.cookie.split(";"),d="",e="",f={};for(var g=0;g<c.length;g++){var h=c[g];while(h.charAt(0)==" ")h=h.substring(1,h.length);if(h.indexOf(b)===0){d=h.substring(b.length,h.length),e=d.substring(0,1);if(e=="{"){f=JSON.parse(d);if("v"in f)return f.v}return d=="undefined"?undefined:unescape(d)}}return null},remove:function(a){this.set(a,"",-1)}}}();return a})