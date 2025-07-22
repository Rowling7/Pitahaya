
//简洁模式-----开始
// 获取需要动画控制的元素集合
const elements = [
    document.querySelector('.mainContainer')
].filter(Boolean);

// 初始化记录原始display值
elements.forEach(element => {
    const originalDisplay = window.getComputedStyle(element).display;
    element.dataset.originalDisplay = originalDisplay;
});

// 读取存储状态并直接应用
document.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('eraserModState');
    if (savedState === 'hidden') {
        elements.forEach(element => {
            element.style.display = 'none'; // 直接隐藏，不触发动画
        });
    }
});

function toggleElements(shouldHide) {
    elements.forEach(element => {
        element.classList.remove('enter', 'exit');

        if (shouldHide) {
            element.classList.add('exit');
            element.addEventListener('animationend', () => {
                element.style.display = 'none';
                localStorage.setItem('simpleModeState', 'hidden'); // 状态存储
            }, { once: true });
        } else {
            element.style.display = element.dataset.originalDisplay;
            element.classList.add('enter');
            localStorage.setItem('simpleModeState', 'shown'); // 状态存储
            element.addEventListener('animationend', () => {
                element.classList.remove('enter');
            }, { once: true });
        }
    });
}

// 点击事件绑定
document.getElementById('eraserMod').addEventListener('click', () => {
    const isAnyVisible = elements.some(el =>
        el.style.display !== 'none' &&
        !el.classList.contains('exit')
    );
    toggleElements(isAnyVisible);

    // 新增状态控制
    const siteFront = document.querySelector('.navbar-brand');
    if (!isAnyVisible) {
        siteFront.classList.remove('active');
        localStorage.removeItem('hoverState');
    } else {
        siteFront.classList.add('active');
        localStorage.setItem('hoverState', 'active');
    }
});

//简洁模式-----结束