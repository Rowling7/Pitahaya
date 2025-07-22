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
