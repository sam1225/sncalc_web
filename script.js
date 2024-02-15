/*
IP Subnet Calculator
  Based on subnetting chapters in below books:
    "CCNA Routing and Switching Study Guide" by Todd Lammle
  Validations performed using:
    https://www.calculator.net/ip-subnet-calculator.html
    https://www.tunnelsup.com/subnet-calculator
*/

const ipTotalBitCount = 32;
const maxOctetDecimal = 255;
const maxNetworkBitsForUsefulHosts = 30;


var ipValidationDict = {};
var hostsPerSubnetCalcDict = {};
var cidrToSubnetMaskDict = {};
var subnetCalcDict = {};
var subnetListDict = {};
var subnetListArray = [];


function resetData() {
  ipValidationDict = {};
  hostsPerSubnetCalcDict = {};
  cidrToSubnetMaskDict = {};
  subnetCalcDict = {};
  subnetListDict = {};
  subnetListArray = [];
}


function ipv4Operation() {
    let ipv4 = document.querySelector('#ipv4').value;
    let cidr = document.querySelector('#cidr').value;

    if (ipv4 === '') {
        document.querySelector('#error_alert').innerHTML = `
        <div class="bs-example">
          <div class="alert alert-info alert-dismissible fade show">
            <strong>Error! </strong>IP is empty
            <button type="button" class="close" data-dismiss="alert">&times;</button>
          </div>
        </div>
        `
        document.querySelector('#result').innerHTML = "";
    } else if (cidr === '') {
        document.querySelector('#error_alert').innerHTML = `
        <div class="bs-example">
          <div class="alert alert-info alert-dismissible fade show">
            <strong>Error! </strong>CIDR is empty
            <button type="button" class="close" data-dismiss="alert">&times;</button>
          </div>
        </div>
        `
        document.querySelector('#result').innerHTML = "";
    } else {
      let ipValidationResult = ipValidation(ipv4);
      let cidrValidationResult = cidrValidation(cidr);
      if (ipValidationResult && cidrValidationResult) {
        hostsPerSubnetCalc(cidr)
        cidrToSubnetMask(cidr);
        subnetCalc(ipv4, cidr, cidrToSubnetMaskDict["Subnet Mask"]);
        document.querySelector('#error_alert').innerHTML = '';
        document.querySelector('#result').innerHTML =
        "<div class=\"alert alert-success\" role=\"alert\">" +
          "<h4 class=\"alert-heading\">Subnetting result:</h4>" +
          "<p>" +
          "<pre>" +
          "<br>IP Address                                :" +
          ipValidationDict["IP Address"] +
          "<br>Network Address                           :" +
          subnetListDict["Network Address"] +
          "<br>Usable Host IP Range                      :" +
          subnetListDict["Usable Host IP Range"] +
          "<br>Broadcast Address                         :" +
          subnetListDict["Broadcast Address"] +
          "<br>Total Hosts per Subnet                    :" +
          hostsPerSubnetCalcDict["Total Hosts per Subnet"] +
          "<br>Usable Hosts per Subnet:                  :" +
          hostsPerSubnetCalcDict["Usable Hosts per Subnet"] +
          "<br>Subnet Mask:                              :" +
          cidrToSubnetMaskDict["Subnet Mask"] +
          "<br>Wildcard Mask:                            :" +
          cidrToSubnetMaskDict["Wildcard Mask"] +
          "<br>Binary Subnet Mask:                       :" +
          cidrToSubnetMaskDict["Binary Subnet Mask"] +
          "<br>CIDR Notation:                            :" +
          cidrToSubnetMaskDict["CIDR Notation"] +
          "<br>Binary Octets:                            :" +
          ipValidationDict["Binary Octets"] +
          "<br>Network Bits (total masked bits):         :" +
          cidrToSubnetMaskDict["Network Bits (total masked bits)"] +
          "<br>Hosts Bits (unmasked bits):               :" +
          cidrToSubnetMaskDict["Hosts Bits (unmasked bits)"] +
          "</pre>" +
          "</p>" +
          "<hr>" +
          "<p class=\"mb-0\">" +
          "<pre>" +
          "Number of Subnets                         : " +
          subnetCalcDict["Number of Subnets"] +
          "<br>" +
          subnetCalcDict["Subnet List"] +
          "<br>" +
          listOfSubnets() +
          "</pre>" +
          "<hr>" +
          "<br>" +
          "</p>" +
        "</div>"
      } else if (!ipValidationResult) {
        document.querySelector('#error_alert').innerHTML = `
        <div class="bs-example">
          <div class="alert alert-info alert-dismissible fade show">
            <strong>Error!</strong> Invalid IP
            <button type="button" class="close" data-dismiss="alert">&times;</button>
          </div>
        </div>
        `
        document.querySelector('#result').innerHTML = "";
      } else if (!cidrValidationResult) {
        document.querySelector('#error_alert').innerHTML = `
        <div class="bs-example">
          <div class="alert alert-info alert-dismissible fade show">
            <strong>Error!</strong> Invalid CIDR
            <button type="button" class="close" data-dismiss="alert">&times;</button>
          </div>
        </div>
        `
        document.querySelector('#result').innerHTML = "";
      }
    }
    resetData();
}


function hostsPerSubnetCalc(cidr) {
    if (cidr <= maxNetworkBitsForUsefulHosts) {
        let unmaskedBits = ipTotalBitCount - cidr;
        let hostsPerSubnet = Math.pow(2, unmaskedBits);
    hostsPerSubnetCalcDict["Total Hosts per Subnet"] = hostsPerSubnet + " (2^unmasked bits) => (2^" + unmaskedBits + ")";
        let usableHostsPerSubnet = Math.pow(2, unmaskedBits) - 2;
    hostsPerSubnetCalcDict["Usable Hosts per Subnet"] = usableHostsPerSubnet + "  (2^unmasked bits - 2) => (2^" + unmaskedBits +  " - 2)";
    } else if (cidr > maxNetworkBitsForUsefulHosts) {
        let unmaskedBits = ipTotalBitCount - cidr;
        let hostsPerSubnet = Math.pow(2, unmaskedBits);
    hostsPerSubnetCalcDict["Total Hosts per Subnet"] = hostsPerSubnet + "  (2^unmasked bits) => (2^" + unmaskedBits + ")";
        hostsPerSubnetCalcDict["Usable Hosts per Subnet"] = 0;
    } else {
        hostsPerSubnetCalcDict["Total Hosts per Subnet"] = 0;
        hostsPerSubnetCalcDict["Usable Hosts per Subnet"] = 0;
    }
}


function listOfSubnets() {
  let str1 = "";
  for(var i in subnetListArray) {
    str1 = str1 + "<br>" + subnetListArray[i];
  }
  return str1;
}


function cidrToSubnetMask(cidr)
{
  cidrToSubnetMaskDict["CIDR Notation"] = "/" + cidr;

  let v_cidr = cidr;
  let str1 = "";
    let cnt1 = 0;
    let cnt2 = 1;
    let cnt3 = 1;

  for (i = 1; i <= ipTotalBitCount; i++) {
    cnt1++;
    if (cnt1 == 8) {
      cnt2++;
      if (cnt2 == 5) {
        if (v_cidr > 0) {
          str1 = str1 + "1";
        } else {
          str1 = str1 + "0";
        }
        break;
      } else {
        if (v_cidr > 0) {
          str1 = str1 + "1.";
        } else {
          str1 = str1 + "0.";
        }
        cnt3++;
      }
      cnt1 = 0;
    } else {
      if (v_cidr > 0) {
        str1 = str1 + "1";
      } else {
        str1 = str1 + "0";
      }
      cnt3++;
    }
    v_cidr--;
  }
  cidrToSubnetMaskDict["Binary Subnet Mask"] = str1;

  let s = str1.split(".");
  let n1 = parseInt(s[0], 2);
  let n2 = parseInt(s[1], 2);
  let n3 = parseInt(s[2], 2);
  let n4 = parseInt(s[3], 2);
  let subnetMask = n1 + "." + n2 + "." + n3 + "." + n4;
  cidrToSubnetMaskDict["Subnet Mask"] = subnetMask;

  // Performing bitwise XOR operation below to invert the binary digits and find the wild mask.
    // Example: 192 XOR 255 => 63    /    11000000  XOR  11111111 => 00111111
    // Refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR
    let wm1 = n1 ^ maxOctetDecimal;
    let wm2 = n2 ^ maxOctetDecimal;
    let wm3 = n3 ^ maxOctetDecimal;
    let wm4 = n4 ^ maxOctetDecimal;
  let wildcardMask = wm1 + "." + wm2 + "." + wm3 + "." + wm4;
  cidrToSubnetMaskDict["Wildcard Mask"] = wildcardMask;

  let networkBits = cidr;
  cidrToSubnetMaskDict["Network Bits (total masked bits)"] = cidr;

  let hostsBits = ipTotalBitCount - cidr;
  cidrToSubnetMaskDict["Hosts Bits (unmasked bits)"] = hostsBits;
}


function ipValidation(ipv4) {
  var ip01 = ipv4.split(".");
  if (ip01.length === 4) {
    let num1 = parseInt(ip01[0]);
    let num2 = parseInt(ip01[1]);
    let num3 = parseInt(ip01[2]);
    let num4 = parseInt(ip01[3]);
    if ( (num1 >= 0 && num1 <= 255) &&
         (num2 >= 0 && num2 <= 255) &&
         (num3 >= 0 && num3 <= 255) &&
         (num4 >= 0 && num4 <= 255)
       ) {
      ipValidationDict["IP Address"] = ipv4;
      let octet1 = num1.toString(2);
      let octet2 = num2.toString(2);
      let octet3 = num3.toString(2);
      let octet4 = num4.toString(2);
      let binaryOctets = octet1.padStart(8, '0') + "." + octet2.padStart(8, '0') + "." + octet3.padStart(8, '0') + "." + octet4.padStart(8, '0');
      ipValidationDict["Binary Octets"] = binaryOctets;
      return true;
    }
    else {
      return false;
    }
  } else {
    return false;
  }
}


function cidrValidation(cidr) {
  if (cidr >= 1 && cidr <= 32) {
    return true;
  } else {
    return false;
  }
}


function subnetCalc(ipv4, cidr, subnetMask) {
    let ip1 = ipv4.split(".");

    let s = subnetMask.split(".");
    let s1 = parseInt(s[0]);
    let s2 = parseInt(s[1]);
    let s3 = parseInt(s[2]);
    let s4 = parseInt(s[3]);

    if (cidr >= 24 && cidr <= maxNetworkBitsForUsefulHosts) {
        let maskedBits = cidr - 24;
        let numberOfSubnets = Math.pow(2, maskedBits);
        subnetCalcDict["Number of Subnets"] = numberOfSubnets + " (2^masked bits on 4th octet) => (2^" + maskedBits + ")";
    let networkPortion = ip1[0] + "." + ip1[1] + "." + ip1[2];
        let subnetNbr = s4;
        let octetPosition = 4;
        subnetCalcDict["Subnet List"] = "All " + numberOfSubnets + " of the Possible /" + cidr + " Networks for " + networkPortion + ".* (valid subnets at 4th octet):";
    subnetList(networkPortion, subnetNbr, octetPosition, ip1[3]);

    } else if (cidr >= 16 && cidr < 24) {
        let maskedBits = cidr - 16;
        let numberOfSubnets = Math.pow(2, maskedBits);
    subnetCalcDict["Number of Subnets"] = numberOfSubnets + " (2^masked bits on 3rd octet) => (2^" + maskedBits + ")";
    let networkPortion = ip1[0] + "." + ip1[1];
        let subnetNbr = s3;
        let octetPosition = 3;
    subnetCalcDict["Subnet List"] = "All " + numberOfSubnets + " of the Possible /" + cidr + " Networks for " + ip1[0] + "." + ip1[1] + ".*.* (valid subnets at 3rd octet):";
        subnetList(networkPortion, subnetNbr, octetPosition, ip1[2]);

    } else if (cidr >= 8 && cidr < 16) {
        let maskedBits = cidr - 8;
        let numberOfSubnets = Math.pow(2, maskedBits);
    subnetCalcDict["Number of Subnets"] = numberOfSubnets + " (2^masked bits on 2nd octet) => (2^" + maskedBits + ")";
    let networkPortion = ip1[0];
        let subnetNbr = s2;
        let octetPosition = 2;
    subnetCalcDict["Subnet List"] = "All " + numberOfSubnets + " of the Possible /" + cidr + " Networks for " + ip1[0] + ".*.*.* (valid subnets at 2nd octet):";
        subnetList(networkPortion, subnetNbr, octetPosition, ip1[1]);

    } else if (cidr >= 1 && cidr < 8) {
        let maskedBits = cidr - 0;
        let numberOfSubnets = Math.pow(2, maskedBits);
    subnetCalcDict["Number of Subnets"] = numberOfSubnets + " (2^masked bits on 1st octet) => (2^" + maskedBits + ")";
        let networkPortion = "";
        let subnetNbr = s1;
        let octetPosition = 1;
    subnetCalcDict["Subnet List"] = "All " + numberOfSubnets + " of the Possible /" + cidr + " Networks (valid subnets at 1st octet):";
        subnetList(networkPortion, subnetNbr, octetPosition, ip1[0]);

    } else {
        subnetCalcDict["Number of Subnets"] = 0;
    }
}


function subnetList(networkPortion, subnetNbr, octetPosition, octetValue) {
    let blockSize = 256 - subnetNbr;
    var i = parseInt(blockSize);
    let octetValueInt = parseInt(octetValue);

    if (octetPosition == 4) {
    let nAddr = networkPortion + ".0";
    let startIP = networkPortion + ".1";
    let endIP = networkPortion + "." + (blockSize - 2);
    let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
    let broadcastAddress = networkPortion + "." + (blockSize - 1);

    subnetListArray.push("Network Address".padEnd(18, ' ') + "Usable Host Range".padEnd(36, ' ')                  + "Broadcast Address".padEnd(20, ' '));
    subnetListArray.push("---------------".padEnd(18, ' ') + "----------------------------------".padEnd(36, ' ') + "-----------------".padEnd(20, ' '));

    if (octetValueInt >= 0 && octetValueInt < i) {
            subnetListDict["Network Address"] = nAddr;
            subnetListDict["Usable Host IP Range"] = usableHostIPRange;
            subnetListDict["Broadcast Address"] = broadcastAddress;
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
        } else {
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
        }

        for (; i <= subnetNbr; i = i + blockSize) {
      let nAddr = networkPortion + "." + i;
      let startIP = networkPortion + "." + (i + 1);
      let endIP = networkPortion + "." + (i + blockSize - 2);
      let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
      let broadcastAddress = networkPortion + "." + (i + blockSize - 1);
            if ( (octetValueInt >= i) && (octetValueInt < (i + blockSize)) ) {
                subnetListDict["Network Address"] = nAddr;
                subnetListDict["Usable Host IP Range"] = usableHostIPRange;
                subnetListDict["Broadcast Address"] = broadcastAddress;
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
            } else {
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
            }
        }
    }

  if (octetPosition == 3) {
    let nAddr = networkPortion + "." + 0 + "." + 0;
    let startIP = networkPortion + "." + 0 + "." + 1;
    let endIP = networkPortion + "." + (i - 1) + "." + 254;
    let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
    let broadcastAddress = networkPortion + "." + (i - 1) + "." + maxOctetDecimal;

        if (octetValueInt >= 0 && octetValueInt < i) {
            subnetListDict["Network Address"] = nAddr;
            subnetListDict["Usable Host IP Range"] = usableHostIPRange;
            subnetListDict["Broadcast Address"] = broadcastAddress;
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
        } else {
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
        }

        for (; i <= subnetNbr; i = i + blockSize) {
      let nAddr = networkPortion + "." + i + "." + 0;
      let startIP = networkPortion + "." + i + "." + 1;
      let endIP = networkPortion + "." + (i + blockSize - 1) + "." + 254;
      let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
      let broadcastAddress = networkPortion + "." + (i + blockSize - 1) + "." + maxOctetDecimal;
            if (octetValueInt >= i && octetValueInt < i + blockSize) {
                subnetListDict["Network Address"] = nAddr;
                subnetListDict["Usable Host IP Range"] = usableHostIPRange;
                subnetListDict["Broadcast Address"] = broadcastAddress;
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
            } else {
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
            }
        }
  }

  if (octetPosition == 2) {
    let nAddr = networkPortion + "." + 0 + "." + 0 + "." + 0;
    let startIP = networkPortion + "." + 0 + "." + 0 + "." + 1;
    let endIP = networkPortion + "." + (i - 1) + "." + maxOctetDecimal + "." + 254;
    let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
    let broadcastAddress = networkPortion + "." + (i - 1) + "." + maxOctetDecimal + "." + maxOctetDecimal;

        if (octetValueInt >= 0 && octetValueInt < i) {
            subnetListDict["Network Address"] = nAddr;
            subnetListDict["Usable Host IP Range"] = usableHostIPRange;
            subnetListDict["Broadcast Address"] = broadcastAddress;
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
        } else {
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
        }

        for (; i <= subnetNbr; i = i + blockSize) {
      let nAddr = networkPortion + "." + i + "." + 0 + "." + 0;
      let startIP = networkPortion + "." + 1 + "." + 0 + "." + 1;
      let endIP = networkPortion + "." + (i + blockSize - 1) + "." + maxOctetDecimal + "." + 254;
      let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
      let broadcastAddress = networkPortion + "." + (i + blockSize - 1) + "." + maxOctetDecimal + "." + maxOctetDecimal;
            if (octetValueInt >= i && octetValueInt < i + blockSize) {
                subnetListDict["Network Address"] = nAddr;
                subnetListDict["Usable Host IP Range"] = usableHostIPRange;
                subnetListDict["Broadcast Address"] = broadcastAddress;
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
            } else {
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
            }
        }
  }

  if (octetPosition == 1) {
    let nAddr = 0 + "." + 0 + "." + 0 + "." + 0;
    let startIP = 0 + "." + 0 + "." + 0 + "." + 1;
    let endIP = (blockSize - 1) + "." + maxOctetDecimal + "." + maxOctetDecimal + "." + 254;
    let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
    let broadcastAddress = (blockSize - 1) + "." + maxOctetDecimal + "." + maxOctetDecimal + "." + maxOctetDecimal;

        if (octetValueInt >= 0 && octetValueInt < i) {
            subnetListDict["Network Address"] = nAddr;
            subnetListDict["Usable Host IP Range"] = usableHostIPRange;
            subnetListDict["Broadcast Address"] = broadcastAddress;
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
        } else {
      subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
        }

        for (; i <= subnetNbr; i = i + blockSize) {
      let nAddr = i + "." + 0 + "." + 0 + "." + 0;
      let startIP = i + "." + 0 + "." + 0 + "." + 1;
      let endIP = (i + blockSize - 1) + "." + maxOctetDecimal + "." + maxOctetDecimal + "." + 254;
      let usableHostIPRange = startIP.padEnd(15, ' ') + " - " + endIP.padEnd(15, ' ');
      let broadcastAddress = (i + blockSize - 1) + "." + maxOctetDecimal + "." + maxOctetDecimal + "." + maxOctetDecimal;
            if (octetValueInt >= i && octetValueInt < i + blockSize) {
                subnetListDict["Network Address"] = nAddr;
                subnetListDict["Usable Host IP Range"] = usableHostIPRange;
                subnetListDict["Broadcast Address"] = broadcastAddress;
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' ') + "[current]");
            } else {
        subnetListArray.push(nAddr.padEnd(15, ' ') + "   " + usableHostIPRange + "   " + broadcastAddress.padEnd(15, ' '));
            }
        }
    }
}
