var checkDatetime = function (datetime) {
    if (is.equal(moment(datetime).format('DD-MMM-YYYY'), '01-Jan-0001')) {
        datetime = '';
    }
    if (is.not.empty(datetime)) {
        datetime1 = moment(datetime).format('HH:mm');
        datetime2 = moment(datetime).add(2, 'hours').format('HH:mm');
        datetime = datetime1 + ' - ' + datetime2;
    }
    return datetime;
};

var checkAgentDatetime = function (datetime) {
    if (is.equal(moment(datetime).format('DD-MMM-YYYY'), '01-Jan-0001')) {
        datetime = '';
    }
    if (is.not.empty(datetime)) {
        datetime = moment(datetime).format('DD-MMM-YYYY HH:mm:SSS');
    }
    return datetime;
};

var checkDateFormat=function(datetime){
  if(datetime==='') return true;
  var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
var r = datetime.match(reg);
if(r===null)return 1;
r[2]=r[2]-1;
var d= new Date(r[1], r[2],r[3], r[4],r[5], r[6]);
if(d.getFullYear()!=r[1])return false;

// if(d.getMonth()!=r[2])return false;
if(d.getMonth()==r[2]){
  if(d.getMonth()>0 && d.getMonth()<13){
  }else{   return 1;   }
} 
if(d.getDate()!=r[3])return false;
if(d.getHours()!=r[4])return false;
if(d.getMinutes()!=r[5])return false;
if(d.getSeconds()!=r[6])return false;
return true;


};

var IsDate=function(mystring){
  var reg = /^(\d{4})-(\d{2})-(\d{2})$/;
var str = mystring;
var arr = reg.exec(str);
if (str==="") return true;
if (!reg.test(str)&&RegExp.$2<=12&&RegExp.$3<=31){
alert("请保证中输入的日期格式为yyyy-mm-dd或正确的日期!");
return false;
}
return true;

};


var objClone = function (obj) {
    var newObj = {};
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (is.object(obj[prop])) {
                newObj[prop] = objClone(obj[prop]);
            } else {
                if (is.null(obj[prop]) || is.undefined(obj[prop]) || is.equal(obj[prop], 'undefined')) {
                    newObj[prop] = '';
                } else {
                    if (is.string(obj[prop])) {
                        newObj[prop] = obj[prop].replace(/[\']/g, '\'\'');
                        // newObj[prop] = obj[prop].toString().replace("'", "''");
                    } else {
                        newObj[prop] = obj[prop];
                    }
                }
            }
        }
    }
    return newObj;
};
