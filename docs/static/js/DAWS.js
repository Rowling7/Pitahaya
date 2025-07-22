// 搜索功能 Search-----开始
// 下拉菜单交互逻辑
const trigger = document.querySelector('.triggerName');
const options = document.querySelector('.custom-options');
const nativeSelect = document.getElementById('engineSelect');

// 点击触发按钮
trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = options.classList.contains('flex');

    if (isOpen) {
        // 关闭菜单逻辑
        options.classList.add('none');
        options.classList.remove('flex');
        setTimeout(() => {
            options.style.display = 'none';
        }, 300);
    } else {
        // 打开菜单逻辑
        options.style.display = 'flex';
        requestAnimationFrame(() => {
            options.classList.add('flex');
            options.classList.remove('none');
        });
    }
});

document.addEventListener('click', function (e) {
    if (!options.contains(e.target) && !trigger.contains(e.target)) {
        options.classList.add('none'); // 添加隐藏动画类
        options.classList.remove('flex');
        setTimeout(() => {
            options.style.display = 'none';
        }, 300); // 确保动画完成后再设置display: none
    }
});

// 选择选项
document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function () {
        const value = this.textContent;
        trigger.textContent = value;
        nativeSelect.value = this.dataset.value;
        document.getElementById('engineselect').value = this.dataset.value;
        options.style.display = 'none';
        options.classList.remove('flex');
        options.classList.add('none');
    });
});

// 关闭菜单
document.addEventListener('click', function (e) {
    if (!options.contains(e.target) && !trigger.contains(e.target)) {
        options.classList.add('none');
        options.classList.remove('flex');
        setTimeout(() => {
            options.style.display = 'none';
        }, 300);
    }
});

// 阻止表单冒泡
options.addEventListener('click', function (e) {
    e.stopPropagation();
});
// 监听窗口变化并同步宽度
function updateOptionsWidth() {
    const formWidth = document.querySelector('.searchForm').offsetWidth;
    const optionsWidth = formWidth - 22;
    document.querySelector('.custom-options').style.width = `${optionsWidth}px`;
}

// 初始化及事件绑定
window.addEventListener('resize', updateOptionsWidth);
updateOptionsWidth();
document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const engineUrl = nativeSelect.value;
    const query = document.querySelector('input[name="query"]').value.trim();
    if (query) {
        window.location.href = engineUrl + encodeURIComponent(query);
    }
});
// 搜索功能-----结束


//动态调整Dynamic Adjustment-----开始
/* 宽度检测函数 */
function isMobile() {
    return window.innerWidth <= 1100;
}

// 列表展示
const columnControl = document.getElementById("columnCount");
const gridContainer = document.getElementById("content-container");
const columnBaseWidth = 200; // 单列基准宽度
const tabsContainer = document.getElementById("bottomContainer");
const searchContainer = document.getElementById("search-container");

/* 初始列数设置 */
const calculateColumns = () => {
    return Math.min(10, Math.max(1, Math.floor(window.innerWidth / columnBaseWidth))
    );
};
columnControl.value = calculateColumns(); // 统一调用

// 事件监听（新增resize时的列数调整）
columnControl.addEventListener("input", updateColumns);
columnControl.addEventListener("change", updateColumns);

// 优化后的防抖resize处理
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        /* 根据当前设备宽度调整列数 */
        if (isMobile()) {
            columnControl.value = Math.min(10, Math.max(1, Math.floor(window.innerWidth / columnBaseWidth)));
        } else {
            columnControl.value = Math.min(10, Math.max(1, Math.floor(window.innerWidth / columnBaseWidth)));
        }
        updateColumns();
        //initWeightLayout();
    }, 200);
});

function updateColumns() {
    const count = parseInt(columnControl.value);
    const containerWidth = gridContainer.offsetWidth;
    // 动态计算卡片宽度
    const gapTotal = 20 * (count - 1);
    const cardWidth = Math.max(20, (containerWidth - gapTotal - 40) / count);
    document.querySelectorAll(".tab-content").forEach((content) => {
        content.style.gridTemplateColumns = `repeat(${count}, minmax(${cardWidth}px, 1fr))`;
    });
}
//动态调整-----结束


//------------组件动态调整-----开始
/**
 * 动态补齐网格布局中的剩余空间
 * @param {string} containerId - 容器元素的ID
 * @param {number} baseWidth - 基础组件的宽度（px）
 * @param {number} baseHeight - 基础组件的高度（px）
 */
function fillGridGaps(containerId, baseWidth = 240, baseHeight = 240) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 获取所有子组件
    const widgets = Array.from(container.children);
    if (widgets.length === 0) return;

    // 计算容器宽度
    const containerWidth = container.clientWidth;

    // 获取计算每行可以容纳的基础组件数量
    const columns = Math.floor(containerWidth / baseWidth);
    if (columns <= 1) return; // 单列布局不需要补齐

    // 按位置分组行
    const rows = [];
    let currentRow = [];
    let currentRowTop = null;

    widgets.forEach(widget => {
        const rect = widget.getBoundingClientRect();
        if (currentRowTop === null || Math.abs(rect.top - currentRowTop) < 5) {
            // 同一行
            currentRow.push(widget);
            currentRowTop = rect.top;
        } else {
            // 新行
            rows.push(currentRow);
            currentRow = [widget];
            currentRowTop = rect.top;
        }
    });

    if (currentRow.length > 0) {
        rows.push(currentRow);
    }

    // 遍历每一行（除了最后一行）
    for (let i = 0; i < rows.length - 1; i++) {
        const row = rows[i];
        const nextRow = rows[i + 1];

        // 计算当前行已占用的宽度
        const usedWidth = row.reduce((sum, widget) => {
            const rect = widget.getBoundingClientRect();
            return sum + rect.width;
        }, 0);

        // 计算剩余空间
        let remainingWidth = containerWidth - usedWidth;
        if (remainingWidth <= 0) continue;

        // 从下一行查找可以放入剩余空间的组件
        for (let j = 0; j < nextRow.length; j++) {
            const widget = nextRow[j];
            const rect = widget.getBoundingClientRect();

            // 检查组件是否可以放入剩余空间
            if (rect.width <= remainingWidth) {
                // 移动组件到当前行
                const lastInRow = row[row.length - 1];
                if (lastInRow && lastInRow.nextSibling) {
                    container.insertBefore(widget, lastInRow.nextSibling);
                } else {
                    container.appendChild(widget); // 如果没有nextSibling，直接追加到最后
                }
                row.push(widget);
                nextRow.splice(j, 1);
                j--; // 因为删除了一个元素

                // 更新剩余空间
                remainingWidth -= rect.width;
                if (remainingWidth <= 0) break;
            }
        }
    }
}
/**
 * 组合相同宽度且都是半高的相邻组件
 * @param {string} containerId - 容器元素的ID
 */
function combineHalfHeightWidgets(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const widgets = Array.from(container.children);
    if (widgets.length < 2) return;

    // 用于存储需要移除的组件
    const widgetsToRemove = new Set();

    for (let i = 0; i < widgets.length - 1; i++) {
        const currentWidget = widgets[i];
        const nextWidget = widgets[i + 1];

        // 检查两个组件是否都是半高且相同宽度的
        if (currentWidget.classList.contains('per-half-height') &&
            nextWidget.classList.contains('per-half-height') &&
            currentWidget.offsetWidth === nextWidget.offsetWidth) {

            // 生成组合ID
            const combinedId = generateCombinedId(currentWidget.id, nextWidget.id);

            // 创建一个新的容器来组合这两个组件
            const combinedContainer = document.createElement('div');
            combinedContainer.className = 'widget-grid';
            combinedContainer.id = combinedId; // 设置组合ID
            combinedContainer.style.position = 'relative';
            combinedContainer.style.height = '240px'; // 标准高度

            // 将两个半高组件放入新容器
            combinedContainer.appendChild(currentWidget.cloneNode(true));
            combinedContainer.appendChild(nextWidget.cloneNode(true));

            // 调整内部组件样式
            const children = combinedContainer.children;
            children[0].style.height = '50%';
            children[0].style.width = '100%';
            children[0].style.margin = '0';
            children[1].style.height = '50%';
            children[1].style.width = '100%';
            children[1].style.margin = '0';

            // 替换第一个组件
            container.insertBefore(combinedContainer, currentWidget);

            // 标记要移除的原组件
            widgetsToRemove.add(currentWidget);
            widgetsToRemove.add(nextWidget);

            // 跳过下一个组件
            i++;
        }
    }

    // 移除原组件
    widgetsToRemove.forEach(widget => {
        widget.remove();
    });
}
/**
 * 生成组合ID (驼峰命名法)
 * @param {string} id1 - 第一个组件ID
 * @param {string} id2 - 第二个组件ID
 * @returns {string} 组合后的ID
 */
function generateCombinedId(id1, id2) {
    if (!id1 && !id2) return '';

    // 处理空ID情况
    const part1 = id1 || 'widget';
    const part2 = id2 || 'widget';

    // 转换为驼峰命名
    return part1.toLowerCase() +
        part2.charAt(0).toUpperCase() +
        part2.slice(1).toLowerCase();
}

// 使用示例 - 在页面加载和窗口大小变化时调用
window.addEventListener('load', () => {
    fillGridGaps('widget-container');
    combineHalfHeightWidgets('widget-container');
});

window.addEventListener('resize', () => {
    fillGridGaps('widget-container');
    combineHalfHeightWidgets('widget-container');
});


//------------ 组件拖拽排序功能 -----开始
/**
 * 初始化拖拽排序功能
 */
function initDragSort() {
    const container = document.getElementById('widget-container');
    if (!container) return;

    // 默认组件顺序
    const defaultOrder = [
        "widgetGgridClock",
        "widgetGgridCalendar",
        "widgetGgridWeather",
        "widgetGgridWorkTime",
        "widgetGgridShortcut",
        "widgetGgridHitokoto",
        "widgetGgridWeiboHot"
    ];

    // 检查 localStorage 中是否已有 widgetOrder
    const savedOrder = localStorage.getItem('widgetOrder');

    // 如果不存在，则设置默认顺序
    if (!savedOrder) {
        console.log('No widgetOrder found in localStorage. Using default order.');
        localStorage.setItem('widgetOrder', JSON.stringify(defaultOrder));
    } else {
        console.log('widgetOrder found in localStorage.');
    }

    // 从 localStorage 读取保存的组件顺序
    try {
        const order = savedOrder ? JSON.parse(savedOrder) : defaultOrder;
        reorderWidgets(container, order);
    } catch (e) {
        console.error('Failed to parse saved widget order:', e);
        // 如果解析失败，使用默认顺序
        reorderWidgets(container, defaultOrder);
    }

    // 初始化 SortableJS
    new Sortable(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: function (evt) {
            saveWidgetOrder(container);
        }
    });
}

/**
 * 保存组件顺序到 localStorage
 * @param {HTMLElement} container 
 */
function saveWidgetOrder(container) {
    const order = Array.from(container.children).map(widget => widget.id);
    localStorage.setItem('widgetOrder', JSON.stringify(order));
}

/**
 * 根据保存的顺序重新排列组件
 * @param {HTMLElement} container 
 * @param {Array} order 
 */
function reorderWidgets(container, order) {
    // 创建一个 id 到元素的映射
    const idMap = {};
    Array.from(container.children).forEach(widget => {
        idMap[widget.id] = widget;
    });

    // 按照保存的顺序重新排列
    order.forEach(id => {
        const widget = idMap[id];
        if (widget) {
            container.appendChild(widget);
        }
    });
}

// 在页面加载时初始化拖拽功能
window.addEventListener('load', () => {
    initDragSort();
    // 确保其他布局函数在拖拽初始化后运行
    setTimeout(() => {
        fillGridGaps('widget-container');
        combineHalfHeightWidgets('widget-container');
    }, 100);
});

// 添加一些基本样式
const style = document.createElement('style');
style.textContent = `
    .sortable-ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }
    .sortable-chosen {
        opacity: 0.8;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
    .sortable-drag {
        opacity: 1!important;
        outline: 2px dashed #4CAF50;
    }
    .widget-grid {
        cursor: move;
        transition: transform 0.2s ease;
    }
    .widget-grid:active {
        cursor: grabbing;
    }
`;
document.head.appendChild(style);
//------------ 组件拖拽排序功能 -----结束
