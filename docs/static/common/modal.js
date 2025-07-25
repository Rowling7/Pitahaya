// modal.js - 模态框功能实现
class Modal {
    constructor(options = {}) {
        this.options = {
            title: "Modal Title",
            content: "",
            buttons: [],
            onClose: null,
            ...options,
        };

        this.init();
        this.bindEvents();
    }

    init() {
        // 创建模态框DOM结构
        this.overlay = document.createElement("div");
        this.overlay.className = "modal-overlay";

        this.modal = document.createElement("div");
        this.modal.className = "modal-container";

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

        this.body = this.modal.querySelector(".modal-body");
        this.footer = this.modal.querySelector(".modal-footer");

        // 设置内容
        if (typeof this.options.content === "string") {
            this.body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            this.body.appendChild(this.options.content);
        }

        // 添加按钮
        this.options.buttons.forEach((btn) => {
            const button = document.createElement("button");
            button.className = `btn btn-${btn.type || "secondary"}`;
            button.textContent = btn.text;
            button.addEventListener("click", btn.handler);
            this.footer.appendChild(button);
        });
    }

    bindEvents() {
        // 关闭按钮事件
        this.modal
            .querySelector(".modal-close-btn")
            .addEventListener("click", () => this.close());

        // 点击遮罩层关闭
        this.overlay.addEventListener("click", (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    open() {
        this.overlay.classList.add("active");
        document.body.style.overflow = "hidden";

        // 如果有 onOpen 回调，则执行
        if (typeof this.options.onOpen === "function") {
            setTimeout(() => {
                this.options.onOpen();
            }, 0);
        }
    }

    close() {
        this.overlay.classList.remove("active");
        document.body.style.overflow = "";

        if (typeof this.options.onClose === "function") {
            this.options.onClose();
        }
    }

    setContent(content) {
        this.body.innerHTML = "";
        if (typeof content === "string") {
            this.body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.body.appendChild(content);
        }
    }

    destroy() {
        this.overlay.remove();
    }
}

// 搜索模态框功能
class SearchModal extends Modal {
    constructor(options = {}) {
        super({
            title: "搜索",
            content: '<div class="search-loading">加载中...</div>',
            buttons: [
                {
                    text: "关闭",
                    handler: () => this.close(),
                },
            ],
            ...options,
        });

        this.searchData = [];
        this.initSearchUI();
    }

    async initSearchUI() {
        // 加载搜索数据
        try {
            const response = await fetch("static/data/data.json");
            this.searchData = await response.json();
            // 初始化搜索UI
            this.setContent(`
                <div class="search-modal-content">
                    <div class="search-input-container">
                        <input type="text" class="search-input" placeholder="输入关键词搜索..." autofocus>
                    </div>
                    <div class="search-results-container"></div>
                </div>
            `);

            this.searchInput = this.body.querySelector(".search-input");
            this.resultsContainer = this.body.querySelector(
                ".search-results-container"
            );

            // 在这里直接聚焦
            if (this.searchInput) {
                this.searchInput.focus();
            }

            // 绑定输入事件
            this.searchInput.addEventListener("input", (e) =>
                this.handleSearch(e.target.value)
            );
        } catch (error) {
            this.setContent(
                `<div class="search-error">加载数据失败: ${error.message}</div>`
            );
        }
    }

    handleSearch(keyword) {
        if (!keyword.trim()) {
            this.resultsContainer.innerHTML =
                '<div class="search-empty">请输入搜索关键词</div>';
            console.log("搜索关键词为空");
            return;
        }

        const lowerKeyword = keyword.toLowerCase();

        // 修改搜索逻辑，递归搜索所有children
        const results = [];
        this.searchData.forEach((category) => {
            if (category.children) {
                category.children.forEach((item) => {
                    if (
                        (item.name && item.name.toLowerCase().includes(lowerKeyword)) ||
                        (item.target && item.target.toLowerCase().includes(lowerKeyword))
                    ) {
                        results.push(item);
                    }
                });
            }
        });

        if (results.length === 0) {
            this.resultsContainer.innerHTML =
                '<div class="search-empty">没有找到匹配的结果</div>';
            console.log("没有找到匹配的结果");
            return;
        }

        // 创建网格布局的结果展示，匹配参考样式
        this.resultsContainer.innerHTML = `
        <div class="icon-grid">
            ${results
                .map(
                    (item) => `
                <a href="${item.target || "#"
                        }" target="_blank" rel="noopener noreferrer" class="dynamic-item-container">
                    <div class="nav-item widget-icon dynamic-icon" style="background-image: url('${item.bgImage || ""
                        }')"></div>
                    <span class="dynamic-link" data-bs-toggle="tooltip" data-bs-original-title="${item.name
                        }">${item.name}</span>
                </a>
            `
                )
                .join("")}
        </div>
    `;
        // 初始化工具提示
        this.initTooltips();
    }
    // 添加工具提示初始化方法
    initTooltips() {
        const tooltipTriggerList = [].slice.call(
            this.body.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: "hover", // 确保触发方式是 hover
            });
        });
    }
}

// 设置模态框功能
class SettingsModal extends Modal {
    constructor(options = {}) {
        super({
            title: "系统设置",
            content: `
                <div class="settings-container">
                    <h6>背景效果</h6>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="bgEffectsSwitch">
                        <label class="form-check-label" for="bgEffectsSwitch">启用背景动画</label>
                    </div>
                    <h6>清除设置</h6>
                    <div class="settings-clear-buttons">
                        <!--<button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearWallpaper">壁纸设置</button>-->
                        <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clockFormat">小时制</button>
                        <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearWorkTime">工作时间</button>
                        <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearWidgetOrder">组件顺序</button>
                        <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearBackground">图片背景</button>
                        <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="videoBackgroundSrc">视频背景</button>
                        <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearTheme">主题设置</button>
                        <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearSimpleMode">简洁模式</button>
                        <button class="btn btn-sm btn-danger mb-2 me-2" id="clearAllSettings">清除所有设置</button>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: "关闭",
                    handler: () => this.close(),
                },
            ],
            ...options
        });

        this.initSettingsUI();
    }

    initSettingsUI() {
        // 设置内容
        this.setContent(`
            <div class="settings-container">
                <h6>背景效果</h6>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="bgEffectsSwitch">
                    <label class="form-check-label" for="bgEffectsSwitch">启用背景动画</label>
                </div>
                <h6>清除设置</h6>
                <div class="settings-clear-buttons">
                    <!--<button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearWallpaper">壁纸设置</button>-->
                    <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clockFormat">小时制</button>
                    <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearWorkTime">工作时间</button>
                    <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearWidgetOrder">组件顺序</button>
                    <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearBackground">图片背景</button>
                    <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="videoBackgroundSrc">视频背景</button>
                    <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearTheme">主题设置</button>
                    <button class="btn btn-sm btn-outline-danger mb-2 me-2" id="clearSimpleMode">简洁模式</button>
                    <button class="btn btn-sm btn-danger mb-2 me-2" id="clearAllSettings">清除所有设置</button>
                </div>
            </div>
        `);

        // 初始化开关状态
        const bgEffectsSwitch = this.body.querySelector("#bgEffectsSwitch");

        // 设置背景效果开关初始状态
        const bgEffectsSetting = localStorage.getItem("bgEffects");
        bgEffectsSwitch.checked = bgEffectsSetting !== "disabled"; // 默认启用

        // 为背景效果开关添加实时变化监听
        bgEffectsSwitch.addEventListener("change", function () {
            const enabled = this.checked;
            localStorage.setItem("bgEffects", enabled ? "enabled" : "disabled");
            toggleBackgroundEffects(enabled);
        });

        // 为清除设置按钮添加事件监听
        const clearButtons = [
            //{ id: "clearWallpaper", key: "wallpaperEnabled", label: "壁纸设置" },
            { id: "clockFormat", key: "clockFormat", label: "小时制" },
            { id: "clearWidgetOrder", key: "widgetOrder", label: "组件顺序" },
            { id: "clearWorkTime", key: "workTimeWidgetConfig", label: "工作时间" },
            { id: "clearBackground", key: "selectedBackground", label: "自定义背景" },
            { id: "videoBackgroundSrc", key: "videoBackgroundSrc", label: "自定义背景" },
            { id: "clearTheme", key: "theme", label: "主题设置" },
            { id: "clearSimpleMode", key: "eraserModState", label: "简洁模式" }
        ];

        clearButtons.forEach(button => {
            const element = this.body.querySelector(`#${button.id}`);
            element.addEventListener("click", () => {
                localStorage.removeItem(button.key);
                window.ToastManager.success(`${button.label}已清除`, 1000);
                setTimeout(() => {
                window.location.reload();
            }, 1500);
            });
        });

        const clearAllSettingsBtn = this.body.querySelector("#clearAllSettings");
        clearAllSettingsBtn.addEventListener("click", () => {
            clearButtons.forEach(button => {
                localStorage.removeItem(button.key);
            });
            window.ToastManager.warning("所有设置已清除", 1000);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        });
    }
}

// ModalManager
window.ModalManager = (function () {
    // 私有方法
    const createDynamicModal = function (config) {
        const modal = new (config.customClass || Modal)({
            title: config.title,
            content:
                typeof config.content === "function"
                    ? config.content()
                    : config.content,
            buttons: config.buttons || [],
            onClose: config.onClose,
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

        // 系统设置模态框
        showSettingsModal: function () {
            const modal = createDynamicModal({
                title: '系统设置',
                customClass: SettingsModal,
                content: `
                    <div class="settings-container">
                        <div class="loading">加载中...</div>
                    </div>
                `,
                buttons: [
                    { text: '关闭', handler: () => modal.close() }
                ]
            });
            modal.open();
            return modal;
        },
        // 搜索模态框
        showSearchModal: function () {
            const modal = createDynamicModal({
                title: "搜索",
                customClass: SearchModal,
                content: '<div class="search-loading">加载中...</div>',
                buttons: [{ text: "关闭", handler: () => modal.close() }],
            });
            modal.open();
            return modal;
        },
    };
})();

// 控制背景效果的函数
function toggleBackgroundEffects(enabled) {
    const bgEffectsScript = document.getElementById("bgeffectsJs");

    if (enabled) {
        // 启用背景效果
        if (bgEffectsScript) {
            // 如果脚本存在但被禁用，则启用它
            if (bgEffectsScript.disabled) {
                bgEffectsScript.disabled = false;
                // 重新执行脚本
                const newScript = document.createElement("script");
                newScript.src = bgEffectsScript.src;
                newScript.id = "bgeffectsJs-temp";
                document.head.appendChild(newScript);
                setTimeout(() => {
                    if (newScript.parentNode) {
                        newScript.parentNode.removeChild(newScript);
                    }
                }, 100);
            }
        } else {
            // 如果脚本不存在，创建它
            const script = document.createElement("script");
            script.src = "static/js/BGeffects.js";
            script.id = "bgeffectsJs";
            document.head.appendChild(script);
        }

        // 显示canvas元素
        const canvas = document.getElementById("particleCanvas");
        if (canvas) {
            canvas.style.display = "block";
        }
    } else {
        // 禁用背景效果
        if (bgEffectsScript) {
            bgEffectsScript.disabled = true;
        }

        // 隐藏canvas元素
        const canvas = document.getElementById("particleCanvas");
        if (canvas) {
            canvas.style.display = "none";
        }

        // 如果有背景效果的全局函数，尝试停止动画
        if (typeof window.stopBackgroundEffects === "function") {
            window.stopBackgroundEffects();
        }
    }
}

// 初始化模态框功能
document.addEventListener("DOMContentLoaded", function () {
    // 应用保存的背景效果设置
    const bgEffectsSetting = localStorage.getItem("bgEffects");
    const bgEffectsEnabled = bgEffectsSetting !== "disabled";
    toggleBackgroundEffects(bgEffectsEnabled);

    // 为设置按钮绑定模态框
    const settingsBtn = document.getElementById("settings");
    if (settingsBtn) {
        settingsBtn.addEventListener(
            "click",
            window.ModalManager.showSettingsModal
        );
    }

    // 为搜索按钮绑定模态框
    const searchIcon = document.getElementById("searchIcon");
    if (searchIcon) {
        searchIcon.addEventListener("click", window.ModalManager.showSearchModal);
    }
});
