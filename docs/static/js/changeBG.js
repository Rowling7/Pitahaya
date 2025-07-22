let cardData = Array.from({ length: 72 }, (_, i) => {
    const num = (i + 1).toString().padStart(3, '0');
    //const num = (99 - i).toString().padStart(3, '0');
    return {
        imgSrc: `static/background/bg${num}.png`,
        title: "",
        description: "",
        alt: ""
    };
});
console.log(cardData);


let currentPage = 1;          // 当前页码
const itemsPerPage = 9;       // 每页显示的图片数量
const totalPages = Math.ceil(cardData.length / itemsPerPage); // 总页数

// 暗黑模式管理
const themeManager = {
    init: function () {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) document.body.classList.add(savedTheme);
        this.updateButtonIcon();
    },
    toggle: function () {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark-mode' : '');
        this.updateButtonIcon();
    },
    updateButtonIcon: function () {
        const icon = document.querySelector('#themeToggle i');
        icon.className = document.body.classList.contains('dark-mode')
            ? 'bi bi-sun'
            : 'bi bi-moon-stars';
    }
};

function renderCards() {
    const container = document.querySelector("[data-card-container]");
    container.innerHTML = "";

    // 计算当前页的数据范围
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = cardData.slice(start, end);

    // 渲染当前页的卡片
    paginatedData.forEach(item => {
        const col = documentTemplate();
        const card = createCardElement(item);
        col.appendChild(card);
        container.appendChild(col);
    });
}

// 创建卡片模板
function createCardElement(item) {
    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm";
    card.style.borderRadius = "20px";

    // 创建图片元素并绑定点击事件
    const img = document.createElement("img");
    img.src = item.imgSrc;
    img.className = "card-img-top";
    img.alt = item.alt || "卡片图片";
    img.style.cssText = "height: 200px; object-fit: cover; border-radius: 18px; cursor: pointer;";
    img.addEventListener("click", () => {
        localStorage.setItem("selectedBackground", item.imgSrc);
        window.location.href = "index.html";
    });

    // 创建卡片内容
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    cardBody.innerHTML = `
        <h5 class="card-title">${item.title || "默认标题"}</h5>
        <p class="card-text">${item.description || "暂无描述"}</p>
    `;

    // 组装卡片
    card.appendChild(img);
    //card.appendChild(cardBody);
    return card;
}

// 创建列容器
function documentTemplate() {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 mb-4";
    return col;
}
function renderPagination() {
    const paginationContainer = document.querySelector("[data-pagination]");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = ""; // 清空旧内容

    // 添加上一页按钮
    const prevButton = document.createElement("button");
    prevButton.textContent = "上一页";
    prevButton.className = "btn btn-outline-primary mx-1";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderCards();
            renderPagination();
        }
    });
    paginationContainer.appendChild(prevButton);

    // 计算要显示的页码
    const visiblePages = [];
    const maxVisiblePages = 10; // 最多显示10个页码

    if (totalPages <= 12) {
        // 总页数小于等于12，显示所有页码
        for (let i = 1; i <= totalPages; i++) {
            visiblePages.push(i);
        }
    } else {
        // 总页数大于12，显示前10页和最后一页
        visiblePages.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // 如果当前页接近末尾，则显示当前页附近的页码
        if (currentPage > totalPages - 5) {
            visiblePages.length = 0; // 清空数组
            for (let i = totalPages - 9; i <= totalPages; i++) {
                if (i > 0) visiblePages.push(i);
            }
        }
        // 如果当前页在中间，则显示当前页附近的页码
        else if (currentPage > 10) {
            visiblePages.length = 0; // 清空数组
            visiblePages.push(1, 2); // 保留前两页
            visiblePages.push("..."); // 添加省略号
            // 添加当前页附近的页码
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                visiblePages.push(i);
            }
            visiblePages.push("..."); // 添加省略号
            visiblePages.push(totalPages - 1, totalPages); // 最后两页
        } else {
            // 默认情况：显示前10页和最后一页
            visiblePages.push("...");
            visiblePages.push(totalPages);
        }
    }

    // 渲染页码按钮
    visiblePages.forEach(page => {
        if (page === "...") {
            const ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.className = "mx-1 align-self-center";
            paginationContainer.appendChild(ellipsis);
        } else {
            const button = document.createElement("button");
            button.textContent = page;
            button.className = "btn btn-outline-primary mx-1";
            if (page === currentPage) {
                button.classList.add("active");
            }
            button.addEventListener("click", () => {
                currentPage = page;
                renderCards();
                renderPagination();
            });
            paginationContainer.appendChild(button);
        }
    });

    // 添加下一页按钮
    const nextButton = document.createElement("button");
    nextButton.textContent = "下一页";
    nextButton.className = "btn btn-outline-primary mx-1";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderCards();
            renderPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}
// 初始化
document.addEventListener("DOMContentLoaded", () => {
    themeManager.init();
    renderCards();
    renderPagination(); // 初始化分页控件

    // 绑定事件
    document.getElementById("themeToggle").addEventListener("click", () => {
        themeManager.toggle();
    });
});