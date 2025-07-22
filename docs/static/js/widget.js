// 新增的 PopupWidget 类
class PopupWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: null,      // 必须指定挂载容器ID
      content: '',           // 弹窗内容
      darkMode: false,        // 是否暗黑模式
      fullCover: true        // 是否完全覆盖容器
    };

    // 合并配置
    this.options = { ...this.defaultOptions, ...options };

    // 注入样式
    this.injectStyles();

    // 初始化弹窗
    this.init();
  }

  injectStyles() {
    const styleId = 'popupWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.12);
        backdrop-filter: blur(5px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .popup-container {
        position: relative;
        width: 60vw;
        height: 60vh;
        max-width: 1040px;
        max-height: 540px;
        background-color: var(--bg-color);
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .popup-body {
        flex: 1;
        max-width: 1040px; /* 最大宽度限制 */
        max-height: 540px; /* 最大高度限制 */
        padding: 16px;
        overflow: auto;
        color: var(--text-color);
      }

      /* 暗黑模式适配 */
      .dark-mode .popup-container {
        background-color: #2c2c2c;
      }

      /* 确保弹窗在最上层 */
      .popup-overlay {
        z-index: 9999 !important;
      }

      /* 防止被其他样式影响 */
      .popup-container * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    if (!this.options.containerId) {
      console.error('PopupWidget: 必须指定containerId');
      return;
    }

    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`PopupWidget: 容器 ${this.options.containerId} 不存在`);
      return;
    }

    // 创建弹窗结构
    this.popupElement = document.createElement('div');
    this.popupElement.className = 'popup-overlay';
    this.popupElement.innerHTML = `
        <div class="popup-body ${this.options.darkMode ? 'dark-mode' : ''}">${this.options.content}</div>
    `;

    // 直接添加到body而不是容器，确保全屏覆盖
    document.body.appendChild(this.popupElement);

    this.bindEvents();
  }

  bindEvents() {
    // 点击背景关闭弹窗
    this.popupElement.addEventListener('click', () => {
      this.close();
    });
  }


  updateContent(newContent) {
    const body = this.popupElement.querySelector('.popup-body');
    if (body) {
      body.innerHTML = newContent;
    }
  }

  close() {
    if (this.popupElement && this.popupElement.parentNode) {
      this.popupElement.parentNode.removeChild(this.popupElement);
    }
  }
}


// WeatherWidget
class WeatherWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: 'weatherWidgetContainer', // 默认容器ID
      apiKey: '269d058c99d1f3cdcd9232f62910df1d', // OpenWeatherMap API Key
      defaultCity: 'Weihai', // 默认城市
      cityDataPath: 'static/data/city.json'  //城市数据路径
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  injectStyles() {
    const styleId = 'weatherWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
          @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Bold.woff2') format('woff2');
        font-weight: bold;
        font-display: swap;
      }
      #weatherWidget {
        width: 240px;
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        background: var(#2c3e50);
        color: var(#ecf0f1);
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
        transform: none !important; /* 确保没有变换效果 */
        transition: none !important; /* 取消所有过渡效果 */
      }

      #weatherWidget::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          background-size: cover;
          filter: blur(8px);
          z-index: -1;
      }

      /* 温度区域 */
      #weatherHead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 30%;
        margin-bottom: 10px;
        position: relative;
      }

      #weatherTemp {
        font-size: 36px;
        font-weight: 300;
        position: relative;
      }

      #weatherTemp::after {
        content: "°C";
        font-size: 18px;
        position: absolute;
        top: 3px;
        right: -20px;
        opacity: 0.7;
      }

      /* 温度高低显示 */
      .temperature-extremes {
        display: none;
        /*flex*/
        flex-direction: column;
        align-items: flex-end;
        position: absolute;
        right: 50px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        line-height: 1.2;
      }

      #weatherTempMax,
      #weatherTempMin {
        opacity: 0.7;
        position: relative;
        padding-left: 14px;
        margin: 1px 0;
      }

      #weatherTempMax::before {
        content: "↑";
        position: absolute;
        left: 0;
      }

      #weatherTempMin::before {
        content: "↓";
        position: absolute;
        left: 0;
      }

      /* 天气图标 */
      #weatherimg {
        width: 80px;
        height: 80px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }

      /* 输入区域 */
      #weatherInput {
        display: flex;
        gap: 6px;
        margin-bottom: 8px;
        height: 15%;
      }

      #weatherInput input,
      #weatherInput select,
      #weatherInput button {
        border: none;
        border-radius: 6px;
        padding: 5px 8px;
        background-color: var(rgba(255, 255, 255, 0.1));
        color: var(#ecf0f1);
        transition: all 0.2s ease;
        font-size: 12px;
        border: 1px solid rgba(3, 3, 3, 0.1);
      }

      #weatherInput input {
        flex: 1;
        min-width: 0;
      }

      #weatherInput select {
        width: 70px;
      }

      #weatherInput button {
        background-color: var(#3498db);
        font-weight: 500;
        cursor: pointer;
        width: 60px;
      }

      #weatherInput input:focus,
      #weatherInput select:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(#3498db);
      }

      /* 优化城市选择框样式 */
      #citySelect {
        background-color: var(rgba(255, 255, 255, 0.1));
        color: var(#ecf0f1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        appearance: none;
        /* 移除默认样式 */
        -webkit-appearance: none;
        padding-right: 20px;
        /* 为下拉箭头留出空间 */
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ecf0f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 12px;
        cursor: pointer;
      }

      /* 下拉选项样式 */
      #citySelect option {
        background-color: var(#34495e);
        color: var(#ecf0f1);
        padding: 8px;
      }

      /* 悬停状态 */
      #citySelect:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }

      /* 聚焦状态 */
      #citySelect:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(#3498db);
      }

      /* 禁用默认下拉箭头 (IE) */
      select::-ms-expand {
        display: none;
      }

      /* 主要天气信息 */
      #mainbody {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 8px;
        height: 15%;
      }

      #weatherInfoRow1 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      #site {
        font-size: 13px;
        font-weight: 500;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50%;
      }

      #weatherResult {
        font-size: 13px;
        font-weight: 600;
        text-transform: capitalize;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50%;
      }

      /* 详细天气容器 */
      #detailedbody {
        background-color: var(rgba(255, 255, 255, 0.1));
        border-radius: 10px;
        padding: 10px;
        margin-top: auto;
        height: 30%;
        perspective: 1000px;
        position: relative;
      }

      /* 添加提示 */
      #detailedbody::after {
        content: "悬停查看更多";
        position: absolute;
        bottom: 1px;
        right: 8px;
        font-size: 8px;
        opacity: 0.5;
        transition: opacity 0.3s;
      }

      #detailedbody:hover::after {
        opacity: 0;
      }

      /* 天气详情卡片 */
      .weather-card {
        position: absolute;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        transition: transform 0.6s;
        transform-style: preserve-3d;
      }

      /* 卡片面 */
      .card-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }

      /* 背面 */
      .back {
        transform: rotateY(180deg);
      }

      /* 鼠标悬停时翻转 */
      #detailedbody:hover .weather-card {
        transform: rotateY(180deg);
      }

      /* 调整详情行样式 */
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 11px;
        align-items: center;
      }

      .detail-label {
        opacity: 0.7;
      }

      .detail-value {
        font-weight: 500;
      }

      .weather-widget {
        background: var(--widget-bg);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 8px var(--shadow-color);
        transition: transform 0.3s;

      }

      .weather-widget:hover {
        transform: translateY(-5px);
      }

      .view-icon {
        width: 28px;
        height: 28px;
        margin-right: 5px;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }


  async init() {
    // 创建容器
    this.createContainer();

    // 加载城市数据
    await this.loadCityData();

    // 渲染组件
    this.render();

    // 默认查询天气
    this.getWeather();

    // 绑定事件
    this.bindEvents();
  }

  createContainer() {
    // 如果容器不存在则创建
    if (!document.getElementById(this.options.containerId)) {
      const container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }
    this.container = document.getElementById(this.options.containerId);
  }

  async loadCityData() {
    console.log('Requesting city data from:', this.options.cityDataPath);
    if (!this.options.cityDataPath) {
      console.error('缺少cityDataPath配置');
      return;
    }
    try {
      const response = await fetch(this.options.cityDataPath);
      if (!response.ok) throw new Error('网络响应不正常');

      const data = await response.json();
      if (!data.city) throw new Error('城市数据格式错误');

      this.cityData = data.city.flatMap(group => group.list);
    } catch (error) {
      console.error('加载城市数据失败:', error);
      alert("城市数据加载失败，请检查网络或文件路径！");
    }
  }

  render() {
    // 组件HTML结构
    this.container.innerHTML = `
      <div id="weatherWidget" class="weather-widget">
        <!-- 温度区域 -->
        <div id="weatherHead">
          <div id="weatherTemp"></div>
          <div class="temperature-extremes">
            <div id="weatherTempMax" title="最高温度"></div>
            <div id="weatherTempMin" title="最低温度"></div>
          </div>
          <img id="weatherimg" />
        </div>

        <!-- 输入区域 -->
        <div id="weatherInput">
          <select id="citySelect">
            <option value="Weihai">威海</option>
            <option value="Wuhan">武汉</option>
            <option value="Guiyang">贵阳</option>
          </select>
          <input type="text" id="cityInput" list="citySuggestions" placeholder="城市">
          <datalist id="citySuggestions"></datalist>
          <button id="weatherBtn">查询</button>
        </div>

        <!-- 主要天气信息 -->
        <div id="mainbody">
          <div id="weatherInfoRow1">
            <div id="site"></div>
            <div id="weatherResult"></div>
          </div>
        </div>

        <!-- 详细天气信息 -->
        <div id="detailedbody">
          <div class="weather-card">
            <div class="card-face front">
              <div class="detail-row">
                <div class="detail-label">体感温度</div>
                <div class="detail-value" id="feelsLike"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">风速</div>
                <div class="detail-value" id="windSpeed"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">风向</div>
                <div class="detail-value" id="windDeg"></div>
              </div>
            </div>
            <div class="card-face back">
              <div class="detail-row">
                <div class="detail-label">湿度</div>
                <div class="detail-value" id="weatherHumi"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">大气压</div>
                <div class="detail-value" id="weatherPress"></div>
              </div>
              <div class="detail-row">
                <div class="detail-label">云量</div>
                <div class="detail-value" id="clouds"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 填充城市建议
    if (this.cityData) {
      const datalist = document.getElementById("citySuggestions");
      this.cityData.forEach(city => {
        const option = document.createElement("option");
        option.value = city.name;
        datalist.appendChild(option);
      });
    }

    // 设置默认城市
    document.getElementById("citySelect").value = this.options.defaultCity;;
  }

  bindEvents() {
    // 查询按钮事件
    document.getElementById("weatherBtn").addEventListener("click", () => this.getWeather());

    // 城市选择变化事件
    document.getElementById("citySelect").addEventListener("change", () => this.getWeather());

    // 城市输入变化事件
    document.getElementById("cityInput").addEventListener("change", () => this.getWeather());
  }

  getWeather() {
    let city;
    const inputValue = document.getElementById("cityInput").value.trim();

    if (inputValue === "") {
      city = document.getElementById("citySelect").value;
    } else {
      const isChinese = /[\u4e00-\u9fa5]/.test(inputValue);
      if (isChinese) {
        const matchedCity = this.cityData.find(item => item.name === inputValue);
        city = matchedCity ? matchedCity.pinyin : null;
      } else {
        city = inputValue;
      }
    }

    if (!city) return;

    // 发送天气请求
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.options.apiKey}`)
      .then(response => response.json())
      .then(weatherData => this.updateWeatherUI(weatherData))
      .catch(error => console.error('获取天气数据失败:', error));
  }

  // 获取风力等级
  getWindLevel(speed) {
    if (speed < 0.3) return '0级';
    if (speed < 1.6) return '1级';
    if (speed < 3.4) return '2级';
    if (speed < 5.5) return '3级';
    if (speed < 8.0) return '4级';
    if (speed < 10.8) return '5级';
    if (speed < 13.9) return '6级';
    if (speed < 17.2) return '7级';
    if (speed < 20.8) return '8级';
    if (speed < 24.5) return '9级';
    if (speed < 28.5) return '10级';
    if (speed < 32.7) return '11级';
    return '12级';
  }
  updateWeatherUI(weatherData) {
    // 天气描述翻译
    const weatherDescriptions = {
      'clear sky': '晴空',
      'few clouds': '少云',
      'scattered clouds': '散云',
      'broken clouds': '多云',
      'overcast clouds': '阴天',
      'shower rain': '阵雨',
      'rain': '雨',
      'light rain': '小雨',
      'moderate rain': '中雨',
      'heavy rain': '大雨',
      'thunderstorm': '雷暴',
      'snow': '雪',
      'light snow': '小雪',
      'heavy snow': '大雪',
      'mist': '薄雾',
      'fog': '雾',
      'haze': '霾',
      'dust': '尘',
      'sand': '沙尘',
      'smoke': '烟雾',
      'tornado': '龙卷风'
    };

    const englishDescription = weatherData.weather[0].description.toLowerCase();
    const chineseDescription = weatherDescriptions[englishDescription] || englishDescription;

    // 获取天气图标URL
    const iconUrl = "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" + weatherData.weather[0].icon + ".png";
    document.getElementById("weatherimg").src = iconUrl;

    // 设置模糊背景
    const widget = document.getElementById("weatherWidget");
    widget.style.backgroundImage = `url(${iconUrl})`;
    widget.style.backgroundSize = "cover";
    widget.style.backgroundPosition = "center";
    widget.style.backgroundRepeat = "no-repeat";



    // 更新UI
    document.getElementById("weatherResult").innerHTML = chineseDescription;
    document.getElementById("weatherHumi").innerHTML = weatherData.main.humidity;

    const kdeg = (weatherData.main.temp - 273.15);
    document.getElementById("weatherTemp").innerHTML = kdeg.toFixed(1);

    const kdegmax = (weatherData.main.temp_max - 273.15);
    document.getElementById("weatherTempMax").innerHTML = kdegmax.toFixed(0) + "°";

    const kdegmin = (weatherData.main.temp_min - 273.15);
    document.getElementById("weatherTempMin").innerHTML = kdegmin.toFixed(0) + "°";

    document.getElementById("site").innerHTML = weatherData.name + " / " + weatherData.sys.country;
    document.getElementById("weatherimg").src = "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/" + weatherData.weather[0].icon + ".png";
    document.getElementById("weatherPress").innerHTML = weatherData.main.pressure;

    const feelsLike = (weatherData.main.feels_like - 273.15).toFixed(0);
    document.getElementById("feelsLike").innerHTML = feelsLike + "°";
    // 添加风力等级描述
    const windSpeed = weatherData.wind.speed;
    const windLevel = this.getWindLevel(windSpeed);
    document.getElementById("windSpeed").innerHTML = `${windLevel} | ${windSpeed} m/s`;
    document.getElementById("clouds").innerHTML = weatherData.clouds.all + "%";

    const windDeg = weatherData.wind.deg;
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round((windDeg % 360) / 45) % 8;
    document.getElementById("windDeg").innerHTML = directions[index];
  }
}


// CalendarWidget
class CalendarWidget {
  constructor(options = {}) {
    this.containerId = options.containerId || 'calendarContainer';
    this.date = new Date();
    this.calendarGrid = 35; // 7 * 5 grid
    this.init();
  }

  // 判断闰年
  isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // 获取月份天数
  getDays(year, month) {
    const feb = this.isLeap(year) ? 29 : 28;
    const daysPerMonth = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysPerMonth[month - 1];
  }

  // 获取相邻月份信息
  getNextOrLastDays(date, type) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    if (type === 'last') {
      const lastMonth = (month === 1 ? 12 : month - 1);
      const lastYear = (month === 1 ? year - 1 : year);
      return {
        year: lastYear,
        month: lastMonth,
        days: this.getDays(lastYear, lastMonth)
      };
    }
    if (type === 'next') {
      const nextMonth = (month === 12 ? 1 : month + 1);
      const nextYear = (month === 12 ? year + 1 : year);
      return {
        year: nextYear,
        month: nextMonth,
        days: this.getDays(nextYear, nextMonth)
      };
    }
  }

  // 生成日历数据
  generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const days = this.getDays(year, month);
    const weekIndex = new Date(`${year}/${month}/1`).getDay(); // 0-6

    const { year: lastYear, month: lastMonth, days: lastDays } =
      this.getNextOrLastDays(date, 'last');
    const { year: nextYear, month: nextMonth } =
      this.getNextOrLastDays(date, 'next');

    const calendarTable = [];
    for (let i = 0; i < this.calendarGrid; i++) {
      if (i < weekIndex) {
        calendarTable[i] = {
          year: lastYear,
          month: lastMonth,
          day: lastDays - weekIndex + i + 1,
          isCurrentMonth: false
        };
      } else if (i >= days + weekIndex) {
        calendarTable[i] = {
          year: nextYear,
          month: nextMonth,
          day: i + 1 - days - weekIndex,
          isCurrentMonth: false
        };
      } else {
        calendarTable[i] = {
          year: year,
          month: month,
          day: i + 1 - weekIndex,
          isCurrentMonth: true
        };
      }
    }
    return calendarTable;
  }

  /**
   * 渲染日历
   */
  renderCalendar(create = false) {
    // 生成当前月份的日历数据
    const calendarData = this.generateCalendar(this.date);
    const title = document.getElementById('title');
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const day = this.date.getDate();

    // 更新标题显示年月
    if (title) title.innerText = `${year}-${month.toString().padStart(2, '0')}`;

    const content = document.getElementById('content');
    if (!content) return;

    if (create) {
      // 创建新的日历按钮元素
      const fragment = document.createDocumentFragment();
      calendarData.forEach(item => {
        const button = document.createElement('button');
        const dateStr = `${item.year}-${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
        const dateObj = new Date(`${item.year}/${item.month}/${item.day}`);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const dateType = this.getDateType(dateStr);

        button.setAttribute('date', `${item.year}/${item.month}/${item.day}`);
        button.innerText = item.day;

        // 设置基本样式类
        if (!item.isCurrentMonth) {
          if (dateType === 'public_holiday') {
            button.classList.add('other-month-holiday');
          } else {
            button.classList.add('grey');
          }
        }

        // 按照优先级设置特殊日期样式
        if (dateType === 'transfer_workday') {
          button.classList.add('transfer-workday');
        } else if (dateType === 'public_holiday') {
          button.classList.add('public-holiday');
        } else if (isWeekend) {
          button.classList.add('weekend');
        }

        // 设置当前选中日期和今天样式
        if (item.day === day && item.month === month) {
          button.classList.add('selected');

          // 如果是今天则额外添加today类
          const today = new Date();
          if (today.getDate() === item.day &&
            today.getMonth() + 1 === month &&
            today.getFullYear() === year) {
            button.classList.add('today');
          }
        }

        // 添加日期选择事件
        button.addEventListener('click', () => {
          this.selectDate(button);
        });

        fragment.appendChild(button);
      });
      content.appendChild(fragment);
    } else {
      // 更新现有日历按钮元素
      calendarData.forEach((item, idx) => {
        const button = content.children[idx];
        if (!button) return;

        const dateStr = `${item.year}-${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
        const dateObj = new Date(`${item.year}/${item.month}/${item.day}`);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const dateType = this.getDateType(dateStr);

        // 重置样式并更新显示文本
        button.className = '';
        button.innerText = item.day;

        // 设置基本样式类
        if (!item.isCurrentMonth) {
          if (dateType === 'public_holiday') {
            button.classList.add('other-month-holiday');
          } else {
            button.classList.add('grey');
          }
        }

        // 按照优先级设置特殊日期样式
        if (dateType === 'transfer_workday') {
          button.classList.add('transfer-workday');
        } else if (dateType === 'public_holiday') {
          button.classList.add('public-holiday');
        } else if (isWeekend) {
          button.classList.add('weekend');
        }

        // 设置当前选中日期和今天样式
        if (item.day === day && item.month === month) {
          button.classList.add('selected');

          // 如果是今天则额外添加today类
          const today = new Date();
          if (today.getDate() === item.day &&
            today.getMonth() + 1 === month &&
            today.getFullYear() === year) {
            button.classList.add('today');
          }
        }
      });
    }
  }

  // 改变月份
  changeMonth(type) {
    const newDays = this.getNextOrLastDays(this.date, type);
    this.date.setFullYear(newDays.year);
    this.date.setMonth(newDays.month - 1);
    this.date.setDate(1);
    this.renderCalendar();
  }

  // 选中日期
  selectDate(button) {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const newDay = Number(button.innerText);

    this.date.setDate(newDay);

    if (button.classList.contains('grey')) {
      let newMonth, newYear;
      if (newDay < 15) { // next
        newMonth = (month === 12 ? 1 : month + 1);
        newYear = (month === 12 ? year + 1 : year);
      } else { // last
        newMonth = (month === 1 ? 12 : month - 1);
        newYear = (month === 1 ? year - 1 : year);
      }
      this.date.setMonth(newMonth - 1);
      this.date.setFullYear(newYear);
    }
    this.renderCalendar();

    /*console.log("containerid：", this.containerId);
    // 显示弹窗
    const popup = new PopupWidget({
      containerId: this.containerId,
      title: `${year}年${month}月${newDay}日`,
      content: `
            <div id="calendar">
                <div class="header">
                <div class="btn-group">
                    <button class="left"><</button>
                    <button class="right">></button>
                </div>
                <h4 id="title"></h4>
                <button class="skipToToday">今天</button>
                </div>
                <div class="week" style="    margin-top: 2px;">
                <li class="weekend">日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li class="weekend">六</li>
                </div>
                <div id="content"></div>
            </div>
    `,
      darkMode: true
    });*/

  }

  async init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    // 加载节假日数据
    await this.loadHolidayData();

    // 注入HTML结构
    container.innerHTML = `
            <div id="calendarWidget">
                <div class="header">
                <div class="btn-group">
                    <button class="left"><</button>
                    <button class="right">></button>
                </div>
                <h4 id="title"></h4>
                <button class="skipToToday">今天</button>
                </div>
                <div class="week" style="    margin-top: 2px;">
                <li class="weekend">日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li class="weekend">六</li>
                </div>
                <div id="content"></div>
            </div>
    `;

    // 注入CSS
    const style = document.createElement('style');
    style.textContent = `
          @font-face {
            font-family: 'CustomSans';
            src: url('static/fonts/NotoSansSC-Regular.woff2') format('woff2');
            font-weight: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'CustomSans';
            src: url('static/fonts/NotoSansSC-Bold.woff2') format('woff2');
            font-weight: bold;
            font-display: swap;
          }

          #calendarWidget {
            font-family: 'CustomSans', sans-serif;
            box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: grid;
            border-radius: 16px;
            padding: 19px;
            background: var(--widget-bg);
            font-weight: normal;
            color: var(--text-color);
          }

          /* 跨月节假日的浅红色样式 */
          .other-month-holiday {
            color: rgba(255, 0, 0, 0.5) !important;
          }

          /* 跨月普通日期的浅黑色样式 */
          .grey {
            color: rgba(0, 0, 0, 0.3) !important;
          }

          /* 周末样式 */
          .weekend {
            color: red !important;
          }

          /* 节假日样式 */
          .public-holiday {
            color: red !important;
            /* 强制覆盖其他颜色 */
            font-weight: bold !important
          }

          /* 调休工作日样式 */
          .transfer-workday {
            color: black !important;
            font-weight: bold !important;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .header h4 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 500;
          }

          .header button {
            background: var(--option-color);
            border: none;
            padding: 6px 8px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;

          }

          .header button:hover {
            background: var(--hover-bg);
          }

          .week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-size: 0.9rem;
          }

          .week li::marker {
            content: none;
          }

          #content {
            margin-left: -4px;
            display: grid;
            grid-template-columns: repeat(7, 1fr);
          }

          #content button {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'CustomSans', sans-serif;
            font-size: 0.95rem;
            padding: 1px 6px;
            color: inherit;
          }

          #content button:hover {
            background: var(--hover-bg);
          }

          #content button.today {
            font-weight: bold;
            color: var(--underline-color);
          }

          #content button.selected {
            background: var(--underline-color);
            color: var(--button-text) !important;
          }

          #content button.grey {
            color: var(--border-color);
            opacity: 0.7;
          }
          .left,.right,.skipToToday{
            color: inherit;
          }

        `;
    document.head.appendChild(style);

    // 初始化日历
    this.renderCalendar(true);

    // 绑定事件
    document.querySelector('.left').addEventListener('click', () => this.changeMonth('last'));
    document.querySelector('.right').addEventListener('click', () => this.changeMonth('next'));
    document.querySelector('.skipToToday').addEventListener('click', () => {
      this.date = new Date();
      this.renderCalendar();
    });

  }
  async loadHolidayData() {
    try {
      const response = await fetch('static/data/2025.json');
      this.holidays = await response.json();
    } catch (error) {
      console.error('加载节假日数据失败:', error);
      this.holidays = { dates: [] };
    }
  }

  getDateType(dateStr) {
    const holiday = this.holidays.dates.find(d => d.date === dateStr);
    return holiday ? holiday.type : null;
  }

}


// ShortcutWidget 无字不设置字体
class ShortcutWidget {
  constructor(options) {
    this.containerId = options.containerId || 'shortcutContainer';
    this.shortcuts = options.shortcuts || [
      {
        url: "http://www.bilibili.com",
        icon: "static/ico/bilibili.png",
        alt: "bilibili"
      },
      {
        url: "https://www.douyin.com/",
        icon: "static/ico/douyin.png",
        alt: "抖音"
      },
      {
        url: "https://github.com/",
        icon: "static/ico/github-black.png",
        alt: "GitHub"
      },
      {
        url: "#",
        icon: "static/ico/loading0_compressed.gif",
        alt: "加载中"
      }
    ];

    this.injectStyles();
    this.init();
  }

  injectStyles() {
    const styleId = 'shortcutWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #shortcutWidget {
        width: 240px ;
        height: 240px ;
        border-radius: 16px;
        padding: 19px;
        background: var(--widget-bg);
        color: var(#ecf0f1);
        font-family: 'Noto Sans SC', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 15px;
        box-sizing: border-box;
        overflow: hidden;

      }
      .shortcut-icon {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        border-radius: 8px;
      }
      .shortcut-icon:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-3px);
      }
      .shortcut-icon img {
        width: 80px;
        height: 80px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        border-radius: 20px;
      }
      .shortcut-icon span {
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div id="shortcutWidget">
        ${this.shortcuts.map(item => `
          <a href="${item.url}" class="shortcut-icon">
            <img src="${item.icon}" alt="${item.alt}">
          </a>
        `).join('')}
      </div>
    `;
  }
}


//  ClockWidget
class ClockWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: 'clockContainer',
      use24HourFormat: true,  // 默认24小时制
      highlightColor: "#9c27b0" // 数字7的高亮颜色
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  injectStyles() {
    const styleId = 'clockWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
     @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Bold.woff2') format('woff2');
        font-weight: bold;
        font-display: swap;
      }
      #clockWidget {
        width: 240px;
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        background: var(--widget-bg) ;
        color: var(--text-color);
        font-family: 'CustomSans', sans-serif;
        font-weight: bold;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;

      }

      .time-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
      }

      .hm-row {
        display: flex;
        align-items: baseline;
        font-size: 66px;
        line-height: 1;
      }

      .time-colon {
        animation: blink 1s infinite;
        color: purple;
        padding: 0 5px;
      }

      .seconds {
        font-size: 36px;
      }

      .highlight-seven {
        color: ${this.options.highlightColor} !important;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .format-toggle {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        color: inherit;
        font-family: inherit;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 15px;
      }

      .format-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    container.innerHTML = `
      <div id="clockWidget">
        <div class="time-display">
          <div class="hm-row">
            <span id="hours">00</span>
            <span class="time-colon">:</span>
            <span id="minutes">00</span>
          </div>
          <div class="seconds" id="seconds">00</div>
        </div>
        <button class="format-toggle" id="toggleFormat">切换12/24小时制</button>
      </div>
    `;

    // 绑定事件
    document.getElementById('toggleFormat').addEventListener('click', () => {
      this.options.use24HourFormat = !this.options.use24HourFormat;
      this.updateTime();
    });

    // 开始计时
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // 处理小时显示
    if (this.options.use24HourFormat) {
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 转换为12小时制
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    }

    // 更新分钟和秒
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;

    // 高亮数字7
    this.highlightNumber(document.getElementById('hours'));
    this.highlightNumber(document.getElementById('minutes'));
    this.highlightNumber(document.getElementById('seconds'));
  }

  highlightNumber(element) {
    // 清除之前的高亮
    Array.from(element.children).forEach(child => {
      if (child.classList.contains('highlight-seven')) {
        child.classList.remove('highlight-seven');
      }
    });

    // 将数字拆分为单个字符并高亮7
    const digits = element.textContent.split('');
    element.innerHTML = digits.map(digit => {
      return digit === '7'
        ? `<span class="highlight-seven">${digit}</span>`
        : digit;
    }).join('');
  }
}


//  社畜倒计时
class WorkTimeWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: 'workTimeContainer',
      workHours: {
        start: '07:50',   // 上班时间
        lunch: '11:20',   // 午饭时间
        end: '17:30',     // 下班时间
        dailySalary: 250  // 日薪
      }
    };

    // 合并用户配置
    this.options = {
      ...this.defaultOptions,
      ...options,
      workHours: {
        ...this.defaultOptions.workHours,
        ...(options.workHours || {})
      }
    };

    // 当前页面状态
    this.currentPage = 'display'; // 'display' 或 'settings'

    // 从 localStorage 加载配置
    this.loadConfig();

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  loadConfig() {
    const savedConfig = localStorage.getItem('workTimeWidgetConfig');
    if (savedConfig) {
      try {
        this.options.workHours = JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
  }

  saveConfig() {
    localStorage.setItem(
      'workTimeWidgetConfig',
      JSON.stringify(this.options.workHours)
    );
  }

  injectStyles() {
    const styleId = 'workTimeWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
    @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Bold.woff2') format('woff2');
        font-weight: bold;
        font-display: swap;
      }
      #workTimeWidget {
        width: 240px;
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        background: var(--widget-bg);
        color: var(--text-color);
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;

        position: relative;
      }

      .breathing-effect {
      animation: breathing 1.5s ease-in-out infinite;
      }

      @keyframes breathing {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.1);
        }
        50% {
          box-shadow: 0 0 20px 10px rgba(255, 0, 0, 0.2);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.3);
        }
      }

      .time-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .countdown-item {
        margin: 8px 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .countdown-label {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 4px;
      }

      .countdown-value {
        font-size: 24px;
        font-weight: bold;
      }

      .salary-display {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .salary-label {
        font-size: 12px;
        opacity: 0.8;
      }

      .salary-value {
        font-size: 24px;
        font-weight: bold;
        background: red;
        /*background: linear-gradient(to right,purple,gold,red);*/
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-block;
        padding: 0 5px; /* 添加一些内边距让渐变更明显 */
      }

      .settings-form {
        padding: 10px;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .settings-row {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      }

      .settings-label {
        width: 70px;
        font-size: 12px;
      }

      .settings-input {
        flex: 1;
        padding: 5px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: inherit;
      }

      .flip-button {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 10px;
        cursor: pointer;
        color: inherit;
      }

      .flip-button:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .save-button {

        padding: 6px;
        border-radius: 4px;
        border: none;
        background: #4CAF50;
        color: white;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    this.render();

    // 开始计时
    this.updateDisplay();
    this.interval = setInterval(() => this.updateDisplay(), 1000);
  }

  render() {
    const container = document.getElementById(this.options.containerId);
    container.innerHTML = `
      <div id="workTimeWidget">
        ${this.currentPage === 'display' ? this.renderDisplayPage() : this.renderSettingsPage()}
        <button class="flip-button" id="flipPage">
          ${this.currentPage === 'display' ? '设置' : '返回'}
        </button>
      </div>
    `;

    // 绑定翻页事件
    document.getElementById('flipPage').addEventListener('click', () => {
      this.currentPage = this.currentPage === 'display' ? 'settings' : 'display';
      this.render();
    });

    // 如果是设置页面，绑定保存事件
    if (this.currentPage === 'settings') {
      document.getElementById('saveSettings').addEventListener('click', () => {
        this.saveSettings();
      });
    }
  }

  renderDisplayPage() {
    return `
      <div class="time-display">
        <div class="countdown-item">
          <div class="countdown-label">吃！吃！吃！</div>
          <div class="countdown-value" id="lunchCountdown">--:--:--</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-label">撤！撤！撤！</div>
          <div class="countdown-value" id="endCountdown">--:--:--</div>
        </div>
        <div class="salary-display">
          <div class="salary-label">窝囊费</div>
          <div class="salary-value" id="salaryEarned">¥0</div>
        </div>
      </div>
    `;
  }

  renderSettingsPage() {
    return `
      <div class="settings-form">
        <div class="settings-row">
          <div class="settings-label">上班时间</div>
          <input type="time" class="settings-input" id="startTime" value="${this.options.workHours.start}">
        </div>
        <div class="settings-row">
          <div class="settings-label">午饭时间</div>
          <input type="time" class="settings-input" id="lunchTime" value="${this.options.workHours.lunch}">
        </div>
        <div class="settings-row">
          <div class="settings-label">下班时间</div>
          <input type="time" class="settings-input" id="endTime" value="${this.options.workHours.end}">
        </div>
        <div class="settings-row">
          <div class="settings-label">日薪(元)</div>
          <input type="number" class="settings-input" id="dailySalary" value="${this.options.workHours.dailySalary}">
        </div>
        <button class="save-button" id="saveSettings">保存设置</button>
      </div>
    `;
  }

  saveSettings() {
    this.options.workHours = {
      start: document.getElementById('startTime').value,
      lunch: document.getElementById('lunchTime').value,
      end: document.getElementById('endTime').value,
      dailySalary: parseFloat(document.getElementById('dailySalary').value)
    };

    this.saveConfig();
    this.currentPage = 'display';
    this.render();
  }

  updateDisplay() {
    if (this.currentPage !== 'display') return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // 解析时间
    const startTime = new Date(`${today}T${this.options.workHours.start}:00`);
    const lunchTime = new Date(`${today}T${this.options.workHours.lunch}:00`);
    const endTime = new Date(`${today}T${this.options.workHours.end}:00`);

    // 计算时间差
    let lunchDiff = lunchTime - now;
    let endDiff = endTime - now;

    // 确保时间差为正数
    lunchDiff = lunchDiff > 0 ? lunchDiff : 0;
    endDiff = endDiff > 0 ? endDiff : 0;

    // 格式化倒计时
    const formatTime = (ms) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
    };

    // 更新倒计时显示
    if (document.getElementById('lunchCountdown')) {
      document.getElementById('lunchCountdown').textContent = formatTime(lunchDiff);
    }
    if (document.getElementById('endCountdown')) {
      document.getElementById('endCountdown').textContent = formatTime(endDiff);
    }

    // 获取widget容器
    const widget = document.getElementById('workTimeWidget');

    // 下班倒计时为0时添加红色边框
    if (endDiff <= 0) {
      widget.style.border = '1px solid red';
      widget.style.boxShadow = '0 8px 10px rgba(255, 0, 0, 0.3)';
      widget.classList.add('breathing-effect');
    } else {
      widget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      widget.style.boxShadow = '0 8px 10px rgba(0, 0, 0, 0.3)';
      widget.classList.remove('breathing-effect');
    }

    // 计算日薪增长（精确到小数点后三位）
    if (now >= startTime && now <= endTime) {
      const workDayDuration = endTime - startTime;
      const workedTime = now - startTime;
      const salaryEarned = (workedTime / workDayDuration) * this.options.workHours.dailySalary;

      if (document.getElementById('salaryEarned')) {
        document.getElementById('salaryEarned').textContent =
          `¥${salaryEarned.toFixed(3)}`;
      }
    } else if (now < startTime) {
      if (document.getElementById('salaryEarned')) {
        document.getElementById('salaryEarned').textContent = '¥0.0000';
      }
    } else {
      if (document.getElementById('salaryEarned')) {
        document.getElementById('salaryEarned').textContent =
          `¥ ${this.options.workHours.dailySalary.toFixed(3)}`;
      }
    }
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    this.render();

    // 开始计时，每秒更新5次
    this.updateDisplay();
    this.interval = setInterval(() => this.updateDisplay(), 200); // 200ms = 每秒5次
  }
}


//  一言组件
class HitokotoWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: 'hitokotoContainer',
      textColor: "var(--text-color)",
      apiUrlType: 'dujitang', // 默认类型
      apiUrls: {
        dujitang: 'https://v2.xxapi.cn/api/dujitang',
        weibo: 'https://v2.xxapi.cn/api/yiyan?type=hitokoto'
      }
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 注入样式
    this.injectStylesHitokoto();

    // 初始化
    this.initHitokoto();

    // 首次加载数据
    this.fetchHitokoto();
  }

  injectStylesHitokoto() {
    const styleId = 'hitokotoWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Bold.woff2') format('woff2');
        font-weight: bold;
        font-display: swap;
      }
      #hitokotoWidget {
        height: 240px;
        border-radius: 16px;
        padding: 19px;
        color: ${this.options.textColor};
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;
        text-align: center;
        background: var(--widget-bg);
        background-position: center;
        background-size: cover;
      }

      #hitokoto {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
        font-size: 18px;
        line-height: 1.5;
      }

      #hitokoto_text {
        color: inherit;
        color: var(--text-color);
        text-decoration: none;
        transition: all 0.3s ease;
      }

      #hitokoto_text:hover {
        opacity: 0.8;
      }
      .type-switcher {
        background: linear-gradient(135deg, #64b5f6, #42a5f5);
        color: white;
        border: none;
        padding: 8px 16px;
        font-size: 14px;
        border-radius: 30px;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }

      .type-switcher:hover {
        background: linear-gradient(135deg, #42a5f5, #1e88e5);
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
      }

      .type-switcher:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }

  async fetchHitokoto() {
    try {
      const apiUrl = this.options.apiUrls[this.options.apiUrlType];
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error('网络错误');

      const data = await response.json();

      if (data.code === 200 && data.data) {
        this.updateHitokoto(data.data);  // 使用 data 字段内容
      } else {
        throw new Error('数据格式错误');
      }
    } catch (error) {
      console.error('获取毒鸡汤失败:', error);
      this.showErrorState();
    }
  }

  updateHitokoto(text) {
    const hitokotoTextEl = document.querySelector('#hitokoto');
    if (hitokotoTextEl) {
      hitokotoTextEl.textContent = text;
      console.log('已更新文本:', text);
    } else {
      console.warn('.hitokoto-text 元素不存在');
    }
  }

  showErrorState() {
    const hitokotoTextEl = document.getElementById('hitokoto_text');
    if (hitokotoTextEl) {
      hitokotoTextEl.textContent = '小时候打喷嚏以为是有人在想我，原来是现在的自己';
    }
  }

  initHitokoto() {
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div id="hitokotoWidget">
        <p id="hitokoto">
          <a href="#" class="hitokoto_text" style="z-index:1;">生气的本质就是在和自己的预期较劲</a>
        </p>
        <button class="type-switcher" id="typeSwitcher" style="z-index:1;">切换内容源</button>
      </div>
    `;

    // 绑定点击刷新事件
    document.getElementById('hitokoto').addEventListener('click', (e) => {
      e.preventDefault(); // 阻止默认跳转行为
      this.fetchHitokoto();
    });

    // 切换类型按钮
    document.getElementById('typeSwitcher').addEventListener('click', () => {
      const types = Object.keys(this.options.apiUrls);
      const currentIndex = types.indexOf(this.options.apiUrlType);
      const nextIndex = (currentIndex + 1) % types.length;
      this.options.apiUrlType = types[nextIndex];
      this.fetchHitokoto();
    });
  }

}

// 热搜组件
class WeiboHotWidget {
  constructor(options = {}) {
    // 默认配置
    this.defaultOptions = {
      containerId: 'weiboHotContainer',  // 默认容器ID
      updateInterval: 300000,             // 默认更新间隔(5分钟)
      maxItems: 50,                       // 最大显示条目
      defaultSource: 'weibo'              // 默认数据源 weibo/baidu
    };

    // 合并用户配置
    this.options = { ...this.defaultOptions, ...options };

    // 当前数据源
    this.currentSource = this.options.defaultSource;

    // API 地址
    this.apiUrls = {
      weibo: 'https://v2.xxapi.cn/api/weibohot',
      baidu: 'https://v2.xxapi.cn/api/baiduhot'
    };

    // 注入样式
    this.injectStyles();

    // 初始化
    this.init();
  }

  injectStyles() {
    const styleId = 'weiboHotWidgetStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Regular.woff2') format('woff2');
        font-weight: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'CustomSans';
        src: url('static/fonts/NotoSansSC-Bold.woff2') format('woff2');
        font-weight: bold;
        font-display: swap;
      }

      #weiboHotWidget {
        height: 240px;
        border-radius: 12px;
        padding: 16px;
        background: var(--widget-bg);
        color:  ${this.options.textColor};
        font-family: 'CustomSans', sans-serif;
        box-shadow: 0 8px 10px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
      }

      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        color: inherit;
      }

      .widget-title {
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
      }

      .switch-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: inherit;
        transition: all 0.3s ease;
        margin-left: 8px;
      }

      .switch-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .refresh-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: inherit;
        transition: all 0.3s ease;
      }

      .refresh-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .hot-list {
        flex: 1;
        overflow-y: auto;
        padding-right: 4px;
      }

      .hot-item {
        display: flex;
        align-items: center;
        justify-content: space-between; /* 内容分布两侧 */
        margin-bottom: 6px;           /* 缩小底部间距 */
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.3s ease;
        height: 32px;                 /* 固定高度 */
        overflow: hidden;
      }

      .hot-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
        transform: translateX(5px);
      }

      .hot-rank {
        width: 24px;
        height: 24px;
        min-width: 24px;
        min-height: 24px;
        border-radius: 50%;
        background-color: #e53935;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 8px;
        font-size: 12px;
        position: relative;
      }

      .hot-rank::after {
        content: "";
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.3);
        pointer-events: none;
      }

      .baidu-hot .hot-rank {
        background-color: #ff4040;
      }

      .weibo-hot .hot-rank {
        background-color: #e53935;
      }

      .hot-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        color: inherit;
      }

      .hot-title {
        font-size: 13px;
        color: inherit;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hot-metric {
        font-size: 11px;
        color: #d32f2f;
        background-color: rgba(255, 0, 0, 0.1);
        border-radius: 4px;
        padding: 1px 4px;
        width: fit-content;
        display: flex-end;
      }

      /* 滚动条样式 */
      .hot-list::-webkit-scrollbar {
        width: 6px;
      }

      .hot-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }

      .hot-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
      }

      .hot-list::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    // 创建容器
    let container = document.getElementById(this.options.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      document.body.appendChild(container);
    }

    // 渲染组件
    this.render();

    // 首次加载数据
    this.fetchHotData();

    // 设置定时更新
    this.startAutoUpdate();
  }

  render() {
    const container = document.getElementById(this.options.containerId);
    container.innerHTML = `
    <div id="weiboHotWidget" class="${this.currentSource}-hot">
      <div class="widget-header">
        <div class="widget-title">${this.currentSource === 'weibo' ? '微博热搜榜' : '百度热搜榜'}</div>
        <button class="switch-btn" id="switchSourceBtn">${this.currentSource === 'weibo' ? '切换百度' : '切换微博'}</button>
        <button class="refresh-btn" id="refreshBtn">刷新</button>
      </div>
      <div class="hot-list" id="hotList">
        <!-- 热搜条目将在这里动态插入 -->
        <div class="loading">加载中...</div>
      </div>
    </div>
  `;

    // 绑定切换数据源事件
    document.getElementById('switchSourceBtn').addEventListener('click', () => {
      this.currentSource = this.currentSource === 'weibo' ? 'baidu' : 'weibo';
      document.getElementById('weiboHotWidget').className = `${this.currentSource}-hot`;
      document.querySelector('.widget-title').textContent = this.currentSource === 'weibo' ? '微博热搜榜' : '百度热搜榜';
      document.getElementById('switchSourceBtn').textContent = this.currentSource === 'weibo' ? '切换百度' : '切换微博';
      this.fetchHotData();
    });

    // 绑定刷新事件
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.fetchHotData();
    });
  }

  async fetchHotData() {
    try {
      const response = await fetch(this.apiUrls[this.currentSource]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.code === 200 && Array.isArray(data.data)) {
        this.displayHotData(data.data.slice(0, this.options.maxItems));
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {

      this.showErrorState();
    }
  }

  displayHotData(data) {
    const hotList = document.getElementById('hotList');
    if (!hotList) return;

    // 创建文档碎片以提高性能
    const fragment = document.createDocumentFragment();

    // 为每个热搜条目创建元素
    data.forEach(item => {
      const hotItem = document.createElement('div');
      hotItem.className = 'hot-item';
      hotItem.innerHTML = `
        <div class="hot-rank">${item.index}</div>
        <div class="hot-info">
          <div class="hot-title">${item.title}</div>
        </div>
        <div class="hot-metric">${item.hot}</div>
      `;


      // 添加点击事件打开链接
      hotItem.addEventListener('click', () => {
        window.open(item.url, '_blank');
      });

      // 添加悬停效果
      hotItem.addEventListener('mouseenter', () => {
        hotItem.style.cursor = 'pointer';
      });

      fragment.appendChild(hotItem);
    });

    // 清空当前内容并添加新内容
    hotList.innerHTML = '';
    hotList.appendChild(fragment);
  }

  showErrorState() {
    const hotList = document.getElementById('hotList');
    if (!hotList) return;

    hotList.innerHTML = `
      < div class= "error-state" >
        <div class="error-icon">⚠️</div>
        <div class="error-message">无法加载热搜数据</div>
        <div class="error-details">请检查网络连接或稍后重试</div>
        <button class="retry-btn">重试</button>
      </div >
        `;

    // 添加重试按钮事件
    hotList.querySelector('.retry-btn').addEventListener('click', () => {
      this.fetchHotData();
    });
  }

  startAutoUpdate() {
    // 如果已存在定时器，先清除
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    // 开始新的定时更新
    this.updateTimer = setInterval(() => {
      this.fetchHotData();
    }, this.options.updateInterval);
  }

  // 销毁方法，用于清理资源
  destroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    const container = document.getElementById(this.options.containerId);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}



// 导出组件
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    PopupWidget,
    WeatherWidget,
    WorkTimeWidget,
    WeiboHotWidget
  };
} else {
  window.PopupWidget = PopupWidget;
  window.WeatherWidget = WeatherWidget;
  window.WorkTimeWidget = WorkTimeWidget;
  window.WorkTimeWidget = WeiboHotWidget;
}