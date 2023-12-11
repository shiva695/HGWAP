export const mobileNoValidation = (mobileNo) => {
  const mobileNoRegex = /^[6-9][0-9]{9}$/;
  if (mobileNoRegex.test(mobileNo)) {
    return true;
  }
  return false;
};

export const otpValidation = (otp) => {
  const otpRegex = /^[0-9]{6}$/;
  if (otpRegex.test(otp)) {
    return true;
  }
  return false;
};

export const emailValidation = (email) => {
  return email.match(
    // eslint-disable-next-line
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  // Reference: https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
};

export const gstValidation = (gstNumber) => {
  return gstNumber.match(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{2}[0-9A-Z]{1}?$/
  );
};

export const fssaiValidation = (fssaiNumber) => {
  return fssaiNumber.match(/^[0-9]{14}$/);
};

// calculating kilometers using two lat, lng points
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in kmreturn d;
  return d.toFixed(1);
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export const roundTo2Decimals = (num) => {
  let multiplicator = Math.pow(10, 2);
  return (
    Math.round(parseFloat((num * multiplicator).toFixed(11))) / multiplicator
  ).toFixed(2);
};

export const generateOrderId = (orderId) => {
  let result = orderId?.toString().padStart(5, "0");
  return result?.replace(/(\d{1})/, "$1-");
};

export const ratingsGroup = (ratings) => {
  if (ratings >= 1000) {
    return parseInt(ratings / 1000) + "k+";
  } else if (ratings >= 100) {
    return parseInt(ratings / 100) + "00+";
  } else {
    return parseInt(ratings / 10) + "0+";
  }
};

export const orderNoFormat = (orderId) => {
  // if < 4 digits then prepend zeroes (45 => 0045)
  // if 4 digits then return as is (1234 => 1234)
  // if > 4 digits then return with hyphen before last 4 digits (1234567 => 123-4567)
  if (orderId?.length > 4) {
    let chars = orderId.slice(-4);
    return orderId.slice(0, -4) + "-" + chars;
  } else {
    return orderId?.padStart(4, "0");
  }
};

export const convertTime12to24 = (time12h) => {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") {
    hours = "00";
  }
  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours}:${minutes}`;
};

export const convertTime24to12 = (time24h) => {
  let timeFormat = time24h;
  let Hrs = +timeFormat.substr(0, 2);
  let hour = Hrs % 12 || 12;
  hour = hour < 10 ? "0" + hour : hour; // leading 0 at the left for 1 digit hours
  let ampm = Hrs < 12 ? " AM" : " PM";
  timeFormat = hour + timeFormat.substr(2, 3) + ampm;
  return timeFormat;
};

export const mobileNumHideFormat = (mobNum) => {
  let spl = mobNum.split("");
  spl.splice(3, 3, "XXX");
  spl.splice(-1, 1, "X");
  return spl.join("");
};
