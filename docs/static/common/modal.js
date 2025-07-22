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

// 在 modal.js 中添加以下代码

class SearchModal extends Modal {
    constructor(options = {}) {
        super({
            title: '搜索',
            content: '<div class="search-loading">加载中...</div>',
            buttons: [
                {
                    text: '关闭',
                    handler: () => this.close()
                }
            ],
            ...options
        });

        this.searchData = [];
        this.initSearchUI();
    }

    async initSearchUI() {
        // 加载搜索数据
        try {
            const response = await fetch('static/data/data.json');
            this.searchData = await response.json();
            console.log('搜索数据加载成功:', this.searchData);
            // 初始化搜索UI
            this.setContent(`
                <div class="search-modal-content">
                    <div class="search-input-container">
                        <input type="text" class="search-input" placeholder="输入关键词搜索..." autofocus>
                    </div>
                    <div class="search-results-container"></div>
                </div>
            `);

            this.searchInput = this.body.querySelector('.search-input');
            this.resultsContainer = this.body.querySelector('.search-results-container');

            // 绑定输入事件
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        } catch (error) {
            this.setContent(`<div class="search-error">加载数据失败: ${error.message}</div>`);
        }
    }

    handleSearch(keyword) {
        if (!keyword.trim()) {
            this.resultsContainer.innerHTML = '<div class="search-empty">请输入搜索关键词</div>';
            console.log('搜索关键词为空');
            return;
        }

        const lowerKeyword = keyword.toLowerCase();

        // 修改搜索逻辑，递归搜索所有children
        const results = [];
        this.searchData.forEach(category => {
            if (category.children) {
                category.children.forEach(item => {
                    if ((item.name && item.name.toLowerCase().includes(lowerKeyword)) ||
                        (item.target && item.target.toLowerCase().includes(lowerKeyword))) {
                        results.push(item);
                    }
                });
            }
        });


        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="search-empty">没有找到匹配的结果</div>';
            console.log('没有找到匹配的结果');
            return;
        }

        // 创建网格布局的结果展示，匹配参考样式
        this.resultsContainer.innerHTML = `
        <div class="icon-grid">
            ${results.map(item => `
                <a href="${item.target || '#'}" target="_blank" rel="noopener noreferrer" class="dynamic-item-container">
                    <div class="nav-item widget-icon dynamic-icon" style="background-image: url('${item.bgImage || ''}')"></div>
                    <span class="dynamic-link" data-bs-toggle="tooltip" data-bs-original-title="${item.name}">${item.name}</span>
                </a>
            `).join('')}
        </div>
    `;
        // 初始化工具提示
        this.initTooltips();
    }
    // 添加工具提示初始化方法
    initTooltips() {
        const tooltipTriggerList = [].slice.call(this.body.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: 'hover'  // 确保触发方式是 hover
            });
        });
    }
}

// 修改 ModalManager 的定义方式
window.ModalManager = (function () {
    // 私有方法
    const createDynamicModal = function (config) {
        const modal = new (config.customClass || Modal)({
            title: config.title,
            content: typeof config.content === 'function' ? config.content() : config.content,
            buttons: config.buttons || [],
            onClose: config.onClose
        });

        if (config.afterCreate) {
            config.afterCreate(modal);
        }

        return modal;
    };

    // 公共API
    return {
        createModal: function (options) {
            return new Modal(options);
        },

        createDynamicModal: createDynamicModal,

        showSettingsModal: function () {
            const modal = createDynamicModal({
                title: '系统设置',
                content: `
                    <div class="settings-container">
                        <h6>主题设置</h6>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="darkModeSwitch">
                            <label class="form-check-label" for="darkModeSwitch">暗黑模式</label>
                        </div>
                    </div>
                `,
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
            return modal;
        },

        showSearchModal: function () {
            const modal = createDynamicModal({
                title: '搜索',
                customClass: SearchModal,
                content: '<div class="search-loading">加载中...</div>',
                buttons: [
                    { text: '关闭', handler: () => modal.close() }
                ]
            });
            modal.open();
            return modal;
        }
    };
})();


// 初始化模态框功能
document.addEventListener('DOMContentLoaded', function () {
    // 为设置按钮绑定模态框
    const settingsBtn = document.getElementById('settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', window.ModalManager.showSettingsModal);
    }

    // 为搜索按钮绑定模态框
    const searchIcon = document.getElementById('searchIcon');
    if (searchIcon) {
        searchIcon.addEventListener('click', window.ModalManager.showSearchModal);
    }
});
