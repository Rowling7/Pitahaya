fetch("static/data/data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const mainContainer = document.querySelector(".mainContainer");
    const navItems = document.querySelectorAll(".nav-item:not(#darkModeToggle)");

    // 清空现有内容（保留首页section）
    const existingSections = document.querySelectorAll(".snap-section:not(.home-section)");
    existingSections.forEach(section => section.remove());

    // 遍历每个分类创建动态内容
    data.forEach((category, index) => {
      // 创建section容器
      const section = document.createElement("section");
      section.classList.add(`${category.id}-section`, "snap-section");
      section.setAttribute("data-index", category.index);
      section.id = `section-${category.id}`;

      // 创建图标网格
      const gridContainer = document.createElement("div");
      gridContainer.classList.add("icon-grid");

      // 添加每个图标项
      category.children.forEach((item) => {
        const iconItem = document.createElement("div");
        iconItem.classList.add("nav-item", "widget-icon", "dynamic-icon");
        iconItem.style.backgroundImage = `url('${item.bgImage}')`;

        const link = document.createElement("a");
        link.href = item.target;
        link.textContent = item.name;
        link.classList.add("dynamic-link");
        link.setAttribute("data-bs-toggle", "tooltip");
        link.setAttribute("title", item.name);

        const itemContainer = document.createElement("a");
        itemContainer.href = item.target;
        itemContainer.target = "_blank";
        itemContainer.rel = "noopener noreferrer";
        itemContainer.classList.add("dynamic-item-container");

        itemContainer.appendChild(iconItem);
        itemContainer.appendChild(link);
        gridContainer.appendChild(itemContainer);
      });

      section.appendChild(gridContainer);
      mainContainer.appendChild(section);

      // 设置导航点击事件
      if (navItems[index]) {
        navItems.forEach((navItem) => {
          navItem.addEventListener("click", (e) => {
            e.preventDefault();
            const liIndex = navItem.getAttribute('li-index');
            const targetSection = document.querySelector(`.snap-section[data-index="${liIndex}"]`);
            if (targetSection) {
              targetSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            } else {
              return;
              //console.log('没有找到匹配section,点击的index:', liIndex);
            }
          });
        });
      }
    });

    // 初始化Bootstrap tooltip
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipEl) => {
      return new bootstrap.Tooltip(tooltipEl);
    });

    // 设置IntersectionObserver监听滚动
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = entry.target.getAttribute('data-index');

            // 更新导航高亮
            navItems.forEach((item) => {
              const itemIndex = item.getAttribute('li-index');
              item.classList.toggle("active", itemIndex === sectionIndex);
            });
          }
        });
      },
      {
        threshold: 0.5,
        root: document.querySelector('.mainContainer')
      }
    );

    // 观察所有动态section
    document.querySelectorAll(".snap-section").forEach((section) => {
      observer.observe(section);
    });

    // 初始化高亮第一个导航项
    if (navItems.length > 0) {
      const firstSection = document.querySelector('.snap-section');
      if (firstSection) {
        const firstIndex = firstSection.getAttribute('data-index');
        navItems.forEach(item => {
          if (item.getAttribute('li-index') === firstIndex) {
            item.classList.add('active');
          }
        });
      }
    }
  })
  .catch((error) => {
    console.error("加载数据失败:", error);
    // 可以在这里添加错误处理UI
    const errorElement = document.createElement('div');
    errorElement.className = 'alert alert-danger';
    errorElement.textContent = '加载数据失败，请刷新页面重试';
    document.querySelector('.mainContainer').appendChild(errorElement);
  });

document.addEventListener('DOMContentLoaded', function () {
  window.initWidgets();

  // 暗黑模式切换
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', function () {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-bs-theme', newTheme);

    // 保存用户偏好
    localStorage.setItem('theme', newTheme);
  });

  // 初始化时检查保存的主题
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', savedTheme);

  // 读取背景图片
  localStorage.setItem("wallpaperEnabled", "false"); // 存储禁用状态
  const selectedBackground = localStorage.getItem('selectedBackground');
  if (selectedBackground) {
    document.getElementById('bodyId').style.backgroundImage = `url(${selectedBackground})`;
    document.getElementById('bodyId').style.backgroundSize = 'cover';
    document.getElementById('bodyId').style.backgroundRepeat = 'no-repeat';
  }
});


// 搜索功能 Search-----开始
document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const engine = document.getElementById('engineSelect').value;
  const query = document.querySelector('input[name="query"]').value.trim();
  if (query) {
    window.location.href = engine + encodeURIComponent(query);
  }
});

// 暗黑模式切换时更新搜索框样式
const updateSearchStyles = () => {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  document.querySelector('.search-form').style.boxShadow =
    `0 2px 10px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'}`;
};

// 初始化时调用
updateSearchStyles();

// 监听暗黑模式切换
document.getElementById('darkModeToggle').addEventListener('click', updateSearchStyles);
// 搜索功能-----结束
