// toast.js - Toast气泡提示功能实现
class Toast {
    constructor() {
        this.container = this.createContainer();
        this.toastQueue = [];
        this.isShowing = false;
    }

    createContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        return new Promise((resolve) => {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;

            // 添加进度条
            const progress = document.createElement('div');
            progress.className = 'toast-progress';
            progress.style.animationDuration = `${duration}ms`;
            progress.style.animationName = 'progress';
            progress.style.animationFillMode = 'forwards';
            toast.appendChild(progress);


            this.container.appendChild(toast);

            // 触发重排，确保动画效果
            toast.offsetHeight;

            // 显示Toast
            toast.classList.add('show');

            // 设置自动隐藏
            const timer = setTimeout(() => {
                this.hide(toast, resolve);
            }, duration);

            // 点击隐藏
            toast.addEventListener('click', () => {
                clearTimeout(timer);
                this.hide(toast, resolve);
            });
        });
    }

    hide(toast, callback) {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            if (callback) callback();
        }, 300);
    }

    // 便捷方法
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// 创建全局Toast实例
window.ToastManager = (function () {
    const toast = new Toast();

    return {
        show: (message, type, duration) => toast.show(message, type, duration),
        success: (message, duration) => toast.success(message, duration),
        error: (message, duration) => toast.error(message, duration),
        warning: (message, duration) => toast.warning(message, duration),
        info: (message, duration) => toast.info(message, duration)
    };
})();

// 确保在DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ToastManager; // 初始化ToastManager
    });
} else {
    window.ToastManager; // 直接初始化
}