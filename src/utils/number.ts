/**
 * 格式化货币
 * @param {number} money 待格式化金额 100000.00
 * @returns {string} 格式化后的货币 ￥100,000.00
 */
export function formatterCurrency(money: number | undefined | null | ''): string {
  // 处理空值情况，默认为0
  if (money === undefined || money === null || money === '') {
    money = 0;
  }
  
  const formatter = new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  });
  
  return formatter.format(money);
}

/**
 * 数字转中文大写金额
 * @param {number | string} number 待格式化金额   12345678.90
 * @returns {string} 中文大写金额  壹仟贰佰叁拾肆万伍仟陆佰柒拾捌元玖角
 */
export function numberToChineseCurrency(number: number | string | undefined | null | ''): string {
  // 处理空值情况
  if (number === undefined || number === null || number === '') {
    return "";
  }

  // 转换为数字处理
  const num = Number(number);
  
  // 处理0的情况
  if (isNaN(num) || num === 0) {
    return "零元";
  }

  // 定义单位数组
  const units = [
    "元", "拾", "佰", "仟", 
    "万", "拾", "佰", "仟", 
    "亿", "拾", "佰", "仟"
  ];
  
  // 定义数字数组
  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  
  // 中文货币字符串
  let chineseCurrency = "";

  // 将数字转换为字符串
  const strNumber = num.toString();

  // 处理整数部分
  const intNumber = strNumber.split(".")[0];
  for (let i = 0; i < intNumber.length; i++) {
    const digit = parseInt(intNumber[i], 10);
    const unit = units[intNumber.length - i - 1];

    // 数字不为0时添加数字和单位
    if (digit !== 0) {
      chineseCurrency += digits[digit] + unit;
    } else {
      // 处理0的情况
      if (i === intNumber.length - 1) {
        // 最后一个数字，添加单位
        if (chineseCurrency) chineseCurrency += unit;
      } else {
        // 处理连续的零
        if (intNumber[i + 1] === '0') {
          if (["亿", "万"].includes(unit)) {
            chineseCurrency += unit;
          }
          continue;
        }
        // 避免连续多个零
        if (chineseCurrency[chineseCurrency.length - 1] !== "零") {
          chineseCurrency += "零";
        }
      }
    }
  }

  // 处理小数部分
  if (strNumber.includes(".")) {
    const decimalPart = strNumber.split(".")[1];
    for (let i = 0; i < decimalPart.length; i++) {
      const digit = parseInt(decimalPart[i], 10);
      if (i === 0) {
        if (digit !== 0) {
          chineseCurrency += digits[digit] + "角";
        }
      } else if (i === 1) {
        chineseCurrency += digits[digit] + "分";
      }
    }
  } else {
    chineseCurrency += "整";
  }

  return chineseCurrency;
}

/**
 * 得到待计算的整数（将小数乘以100后四舍五入）
 * @param {number | string} number 待计算的小数
 * @returns {number} 处理后的整数
 */
export function waitCalculate(number: number | string | undefined | null | ''): number {
  if (number === undefined || number === null || number === '') {
    return 0;
  }
  
  const num = Number(number);
  return Math.round(num * 100);
}

/**
 * 将数字（秒）转换为 00时00分00秒格式
 * @param {number} seconds 秒数
 * @returns {string} 格式化后的时间字符串
 */
export function numberFormatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  // 格式化每个部分为两位数
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(secs).padStart(2, "0");
  
  let timeLong = `${formattedMinutes}分${formattedSeconds}秒`;
  if (hours > 0) {
    timeLong = `${formattedHours}时` + timeLong;
  }
  
  return timeLong;
}
