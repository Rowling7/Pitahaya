// 全局变量定义
let globalData = [];
let currentActiveTabIndex = 0;
let contentFragment = null;
let currentView = 'wszhwf'; // 替死鬼

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 初始化视图切换按钮事件
  document.getElementById('widgetViewBtn')?.addEventListener('click', () => switchView('widget'));
  document.getElementById('linkViewBtn')?.addEventListener('click', () => switchView('link'));

  // 初始化底栏状态
  const bottomContainer = document.getElementById('bottomContainer');
  if (bottomContainer && currentView === 'widget') {
    bottomContainer.style.display = 'none';
  }

  //可快速切换视图 link or widget
  switchView('widget');

  // 读取背景图片gaussianBlur
  localStorage.setItem("wallpaperEnabled", "false"); // 存储禁用状态
  const selectedBackground = localStorage.getItem('selectedBackground');
  if (selectedBackground) {
    document.getElementById('bodyId').style.backgroundImage = `url(${selectedBackground})`;
    document.getElementById('bodyId').style.backgroundSize = 'cover';
    document.getElementById('bodyId').style.backgroundRepeat = 'no-repeat';
  }

  // 高斯模糊
  localStorage.setItem("gaussianBlur", "true");

  // 加载数据
  loadData();
});

// 加载数据
function loadData() {
  fetch("static/data/data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      initLinkView(data);
    })
    .catch((error) => {
      console.error("数据加载失败:", error);
      // 可以在这里添加错误处理UI
      document.getElementById('linkViewBtn').disabled = true;
    });
}

// 初始化搜索视图
function initLinkView(data) {
  globalData = data;
  const tabscontainer = document.getElementById("tabsContainer");
  const contentcontainer = document.getElementById("content-container");

  // 清空容器
  contentcontainer.innerHTML = "";
  tabscontainer.innerHTML = "";

  // 创建内容容器
  const wrapper = document.createElement("div");
  wrapper.className = "content-wrapper";
  wrapper.id = "containerWrapper";
  contentcontainer.appendChild(wrapper);

  // 使用文档片段减少DOM操作
  const tabFragment = document.createDocumentFragment();
  contentFragment = document.createDocumentFragment();

  data.forEach((category, index) => {
    // 创建页签按钮
    const tabBtn = document.createElement("button");
    tabBtn.className = `tab-button${index === 0 ? " active" : ""}`;
    tabBtn.textContent = category.name;
    tabBtn.id = category.id;
    tabBtn.dataset.tabIndex = index;
    tabBtn.addEventListener("click", () => switchTab(index));
    tabFragment.appendChild(tabBtn);

    // 创建内容区
    const tabContent = document.createElement("div");
    tabContent.className = `tab-content${index === 0 ? " active" : ""}`;

    const cardsHTML = category.children
      .map(
        (item) => `
        <div class="card" id="linkCard">
            <a href="${item.target}" target="_blank" aria-label="${item.name}" title="${item.name}">
                <img src="${item.bgImage}" alt="${item.name}" loading="lazy">
                <h5>${item.name.slice(0, 10)}</h5>
            </a>
        </div>
        `
      )
      .join("");

    tabContent.innerHTML = cardsHTML;
    contentFragment.appendChild(tabContent);
  });

  // 批量插入DOM元素
  tabscontainer.append(tabFragment);
  wrapper.append(contentFragment);

  // 初始化列数
  updateColumns();

  // 设置点击事件处理
  setupClickHandlers();
}

// 视图切换函数
function switchView(view) {
  if (currentView === view) return;
  currentView = view;
  const bottomContainer = document.getElementById('bottomContainer');
  const tabsContainer = document.getElementById('tabsContainer');
  const contentContainer = document.getElementById('content-container');
  const linkView = document.getElementById('link-container-view');
  const widgetView = document.getElementById('widget-container');

  // 更新按钮状态
  document.getElementById('widgetViewBtn')?.classList?.toggle('active', view === 'widget');
  document.getElementById('linkViewBtn')?.classList?.toggle('active', view === 'link');

  // 更新视图显示
  document.getElementById('widget-container')?.classList?.toggle('active', view === 'widget');
  document.getElementById('link-container-view')?.classList?.toggle('active', view === 'link');

  // 控制底栏和内容显示/隐藏
  if (view === 'widget') {
    // 切换到组件视图时隐藏所有搜索相关内容
    if (bottomContainer) bottomContainer.style.display = 'none';
    if (tabsContainer) tabsContainer.style.display = 'none';
    if (contentContainer) contentContainer.style.display = 'none';
    widgetView.classList.remove('hidden');
    linkView.classList.add('hidden');
  } else {
    // 切换到搜索视图时显示所有相关内容
    if (bottomContainer) bottomContainer.style.display = 'flex';
    if (tabsContainer) tabsContainer.style.display = 'flex';
    if (contentContainer) contentContainer.style.display = 'flex';
    linkView.classList.remove('hidden');
    widgetView.classList.add('hidden');

    // 如果是搜索视图且数据未加载，尝试重新加载
    if (globalData.length === 0) {
      loadData();
    }
  }
}

// 设置点击事件处理
function setupClickHandlers() {
  const contentContainer = document.getElementById("bodyId");

  contentContainer.addEventListener("click", (e) => {
    // 如果在组件视图或点击了特定元素，则不处理
    if (currentView === 'widget' ||
      e.target.closest(".card") ||
      e.target.closest(".viewSwitcher") ||
      e.target.closest("#searchResultsHeader") ||
      e.target.closest("#settingsDropdown") ||
      (document.getElementById("settingsDropdown")?.style.display === "block")) {
      return;
    }

    // 点击区域判断
    const currentTab = document.querySelector(".tab-button.active");
    if (!currentTab) return;

    const currentIndex = parseInt(currentTab.dataset.tabIndex);
    const totalTabs = document.querySelectorAll(".tab-button").length;

    // 排除特定区域的点击
    if (isInExcludeZone(e.clientY)) return;

    const zone = getClickZone(contentContainer, e.clientX);
    let newIndex = currentIndex;

    if (zone === "left") {
      newIndex = (currentIndex - 1 + totalTabs) % totalTabs;
    } else {
      newIndex = (currentIndex + 1) % totalTabs;
    }
    switchTab(newIndex);
  });
}

// 点击区域判断函数
function getClickZone(container, clickX) {
  const rect = container.getBoundingClientRect();
  const clickPosition = clickX - rect.left;
  return clickPosition < rect.width / 2 ? "left" : "right";
}

// 排除区域检测
function isInExcludeZone(clientY) {
  const elements = [
    document.getElementById("headerContainer"),
    document.getElementById("search-container"),
    document.getElementById("tabsContainer"),
    document.getElementById("viewSwitcher")
  ];

  return elements.some(element => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return clientY >= rect.top && clientY <= rect.bottom;
  });
}

// 页签切换函数
function switchTab(index) {
  currentActiveTabIndex = index;
  const tabs = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");
  const oldContent = document.querySelector(".tab-content.active");
  const newContent = document.querySelectorAll(".tab-content")[index];

  tabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
  });

  switchContent(oldContent, newContent);

  // 滚动到顶部
  const wrapper = document.getElementById("containerWrapper");
  if (wrapper) {
    wrapper.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  updateColumns();
}

// 内容切换动画
function switchContent(oldContent, newContent) {
  const current = oldContent;
  if (current) {
    current.classList.add('exit');
    current.addEventListener('animationend', () => {
      current.classList.remove('active', 'exit');
      activateNewContent(newContent);
    }, { once: true });
  } else {
    activateNewContent(newContent);
  }
}

function activateNewContent(newContent) {
  newContent.classList.add('enter', 'active');
  newContent.addEventListener('animationend', () => {
    newContent.classList.remove('enter');
  }, { once: true });
}

// 更新列数
function updateColumns() {
  const columnCount = document.getElementById("columnCount")?.value || 4;
  document.documentElement.style.setProperty('--column-count', columnCount);
}

// 搜索功能实现
document.getElementById("inpt_search")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const savedIndex = currentActiveTabIndex;
    const keyword = e.target.value.trim();
    if (!keyword) return;

    // 执行搜索逻辑
    const searchResults = [];
    globalData.forEach((category) => {
      category.children.forEach((item) => {
        if (
          item.name.toLowerCase().includes(keyword.toLowerCase()) ||
          item.target.toLowerCase().includes(keyword.toLowerCase())
        ) {
          searchResults.push(item);
        }
      });
    });

    // 更新界面显示
    const wrapper = document.getElementById("containerWrapper");
    const tabsContainer = document.getElementById("tabsContainer");
    const cntr = document.querySelector(".cntr");

    // 隐藏原始内容
    tabsContainer.style.display = "none";
    cntr.style.display = "none";

    // 生成结果卡片
    const cardsHtml = searchResults
      .map(
        (item) => `
        <div class="card" id="linkCard">
            <a href="${item.target}" target="_blank" aria-label="${item.name}" title="${item.name}">
                <img src="${item.bgImage}" alt="${item.name}" loading="lazy">
                <h5>${item.name.slice(0, 10)}</h5>
            </a>
        </div>
        `
      )
      .join("");

    // 构建搜索结果界面
    wrapper.innerHTML = `
      <div class="search-results-header" id="searchResultsHeader" style="margin-bottom: 0px;">
          <button class="back-button" id="backButton">< 返回</button>
          <h3>找到 ${searchResults.length} 个匹配项</h3>
      </div>
      <div class="search-results-grid"style="padding: 20px;">${cardsHtml}</div>
    `;

    // 返回按钮功能
    document.getElementById("backButton")?.addEventListener("click", () => {
      tabsContainer.style.display = "";
      cntr.style.display = "";
      wrapper.innerHTML = "";

      // 重新生成内容
      const newFragment = document.createDocumentFragment();
      globalData.forEach((category, index) => {
        const tabContent = document.createElement("div");
        tabContent.className = `tab-content${index === currentActiveTabIndex ? " active" : ""}`;
        tabContent.innerHTML = category.children
          .map(
            (item) => `
            <div class="card" id="linkCard">
                <a href="${item.target}" target="_blank" aria-label="${item.name}" title="${item.name}">
                    <img src="${item.bgImage}" alt="${item.name}" loading="lazy">
                    <h5>${item.name.slice(0, 10)}</h5>
                </a>
            </div>
            `
          )
          .join("");
        newFragment.appendChild(tabContent);
      });
      wrapper.appendChild(newFragment);
      switchTab(savedIndex);
      updateColumns();
    });
    updateColumns();
  }
});