interface String {
  format(...args: string[]): string;
}

interface Date {
  monthDays(): number;
  addSeconds(s: number): Date;
}

String.prototype.format = function () {
  var args = arguments;

  if (typeof args[0] != "object") {
    return this.replace(/{\d+}/g, function (m) {
      var index = Number(m.replace(/\D/g, ""));
      return args[index] ? args[index] : m;
    });
  } else {
    var obj = args[0],
      keys = Object.keys(obj);

    return this.replace(/{\w+}/g, function (m) {
      var key = m.replace(/{|}/g, "");
      return obj.hasOwnProperty(key) ? obj[key] : m;
    });
  }
};

Date.prototype.monthDays = function () {
  var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
  return d.getDate();
};

Date.prototype.addSeconds = function (s) {
  return new Date(this.valueOf() + s * 1000);
};

Date.prototype.toJSON = function (key) {
  const tzoffseet = this.getTimezoneOffset();
  this.setMinutes(this.getMinutes() - tzoffseet);
  let isoformat = this.toISOString();
  isoformat = isoformat.replace("Z", "");
  this.setMinutes(this.getMinutes() + tzoffseet);

  return isoformat;
};
