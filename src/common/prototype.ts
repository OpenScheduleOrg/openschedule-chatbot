export {};

declare global {
  interface Number {
    toClockTime(): string;
  }
  interface String {
    format(...args: string[]): string;
    phoneMask(): string;
  }

  interface Date {
    monthDays(): number;
    addSeconds(s: number): Date;
  }
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

String.prototype.phoneMask = function () {
  return `(${this.slice(0, 2)}) 9${this.slice(2, 6)}-${this.slice(6, 10)}`;
};

Date.prototype.monthDays = function () {
  var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
  return d.getDate();
};

Date.prototype.addSeconds = function (s) {
  return new Date(this.valueOf() + s * 1000);
};

Number.prototype.toClockTime = function () {
  const hour = (this.valueOf() / 60) >> 0;
  const minutes = this.valueOf() % 60;

  return String(hour).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
};
