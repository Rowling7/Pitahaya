// modal.js - 模态框功能实现
class Modal {
    constructor(options = {}) {
        this.options = {
            title: 'Modal Title',
            content: '',
            buttons: [],
            onClose: null,
            ...options
        };

        this.init();
        this.bindEvents();
    }

    init() {
        // 创建模态框DOM结构
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';

        this.modal = document.createElement('div');
        this.modal.className = 'modal-container';

        this.modal.innerHTML = `
            <div class="modal-header">
                <h5 class="modal-title">${this.options.title}</h5>
                <button type="button" class="modal-close-btn" aria-label="Close">&times;</button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        this.body = this.modal.querySelector('.modal-body');
        this.footer = this.modal.querySelector('.modal-footer');

        // 设置内容
        if (typeof this.options.content === 'string') {
            this.body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            this.body.appendChild(this.options.content);
        }

        // 添加按钮
        this.options.buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn btn-${btn.type || 'secondary'}`;
            button.textContent = btn.text;
            button.addEventListener('click', btn.handler);
            this.footer.appendChild(button);
        });
    }

    bindEvents() {
        // 关闭按钮事件
        this.modal.querySelector('.modal-close-btn').addEventListener('click', () => this.close());

        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    open() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';

        if (typeof this.options.onClose === 'function') {
            this.options.onClose();
        }
    }

    setContent(content) {
        this.body.innerHTML = '';
        if (typeof content === 'string') {
            this.body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.body.appendChild(content);
        }
    }

    destroy() {
        this.overlay.remove();
    }
}

// 全局模态框管理器
window.ModalManager = {
    createModal: function (options) {
        return new Modal(options);
    },

    // 创建设置模态框
    showSettingsModal: function () {
        const settingsContent = `
            <div class="settings-container">
                <h6>主题设置</h6>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="darkModeSwitch">
                    <label class="form-check-label" for="darkModeSwitch">暗黑模式</label>
                </div>
                <!-- 可以添加更多设置项 -->
            </div>
        `;

        const modal = new Modal({
            title: '系统设置',
            content: settingsContent,
            buttons: [
                {
                    text: '保存',
                    type: 'primary',
                    handler: () => {
                        alert('设置已保存');
                        modal.close();
                    }
                },
                {
                    text: '取消',
                    handler: () => modal.close()
                }
            ]
        });

        modal.open();
    }
};

// 初始化模态框功能
document.addEventListener('DOMContentLoaded', function () {
    // 为设置按钮绑定模态框
    const settingsBtn = document.getElementById('settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', window.ModalManager.showSettingsModal);
    }
});