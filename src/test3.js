var myCommonFunctions = {
  getKey: function(podItem) {
    return 1;
  }
}

console.log(myCommonFunctions.getKey({a: 2}));

var obj = {
  data : {
    "b": '0',
    "c": '1',
    "a": '2'
  }
}

var arr = [];

console.log(Object.keys(obj.data).sort());

Object.keys(obj.data).sort().forEach((elem) => { arr.push(obj.data[elem])})

console.log(arr);
