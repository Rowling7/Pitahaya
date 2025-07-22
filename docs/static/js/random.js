// 添加视频预览元素引用
const previewImage = document.getElementById("previewImage");
const previewVideo = document.getElementById("previewVideo");
document.addEventListener("DOMContentLoaded", function () {
    // 清除图片预览
    previewImage.src = "";
    // 视频管理数组
    const activeVideos = new Set();

    // 全局可访问的辅助函数
    function pauseAllVideos() {
        console.log("暂停所有视频");
        activeVideos.forEach(vid => {
            if (!vid.paused) {
                vid.pause();
                console.log('暂停列表中的视频');
                vid.currentTime = 0;
            }
        });
    }
    const [
        picHsLink,
        picMnLink,
        picBsLink,
        picWallpaperLink,
        picMN4PhoneLink,
        picMN4PCLink,
        vidMNLink
    ] = [
        "picHsLink",
        "picMnLink",
        "picBsLink",
        "picWallpaperLink",
        "picMN4PhoneLink",
        "picMN4PCLink",
        "vidMNLink"
    ].map(id => document.getElementById(id));



    const cardContainer = document.getElementById("cardContainer");
    const batchDownloadPicBtn = document.getElementById("batchDownloadPicBtn");
    const batchDownloadVidBtn = document.getElementById("batchDownloadVidBtn");
    const loadingSpinner = document.getElementById("loadingSpinner");

    // 请求图片数据并渲染卡片
    async function fetchAndRenderImages(apiUrl) {
        cardContainer.innerHTML = "";
        loadingSpinner.classList.remove("d-none"); // 显示加载动画

        try {
            const requests = Array.from({ length: 9 }, () =>
                fetch(apiUrl).then((res) => res.json())
            );

            const results = await Promise.all(requests);
            const imageUrls = results
                .filter((data) => data.code === 200)
                .map((data) => data.data);

            imageUrls.forEach((url) => {
                const col = document.createElement("div");
                col.className = "col-md-4";

                const card = document.createElement("div");
                card.className = "card shadow-sm h-100";

                const img = document.createElement("img");
                img.src = url;
                img.className = "card-img-top";
                img.style.cursor = "pointer";
                img.addEventListener("click", () => {
                    const modal = new bootstrap.Modal(document.getElementById("imagePreviewModal"));

                    // 隐藏视频预览，显示图片预览
                    previewVideo.classList.add("d-none");
                    previewImage.classList.remove("d-none");

                    previewImage.src = url;
                    modal.show();
                });

                const cardBody = document.createElement("div");
                cardBody.className = "card-body d-flex flex-column";

                const downloadBtn = document.createElement("button");
                downloadBtn.className = "btn btn-sm btn-primary download-btn";
                downloadBtn.innerHTML = '<i class="bi bi-download"></i> 下载图片';
                downloadBtn.addEventListener("click", (e) => {
                    e.stopPropagation(); // 阻止冒泡到图片点击事件
                    downloadImage(url);
                });

                cardBody.appendChild(downloadBtn);
                card.appendChild(img);
                card.appendChild(cardBody);
                col.appendChild(card);
                cardContainer.appendChild(col);
            });
        } catch (error) {
            console.error("获取图片失败:", error);
            cardContainer.innerHTML = "<p class='text-danger'>加载图片失败，请重试。</p>";
        } finally {
            loadingSpinner.classList.add("d-none"); // 隐藏加载动画
        }
    }
    // 请求视频数据并渲染卡片
    async function fetchAndRenderVideos(apiUrl) {
        // 清除之前的视频引用
        activeVideos.clear();
        cardContainer.innerHTML = "";
        loadingSpinner.classList.remove("d-none"); // 显示加载动画

        try {
            const requests = Array.from({ length: 6 }, () =>
                fetch(apiUrl).then((res) => res.json())
            );

            const results = await Promise.all(requests);
            const videoUrls = results
                .filter((data) => data.code === 200)
                .map((data) => data.data);

            videoUrls.forEach((url) => {
                const col = document.createElement("div");
                col.className = "col-md-4";

                const card = document.createElement("div");
                card.className = "card shadow-sm h-100";

                const video = document.createElement("video");
                video.src = url;
                video.className = "card-img-top";
                video.controls = true; // 显示控件
                video.muted = true;
                video.style.cursor = "pointer";
                video.setAttribute('playsinline', ''); // 防止iOS全屏播放

                // 添加播放事件监听
                video.addEventListener('play', function () {
                    // 暂停其他所有视频
                    activeVideos.forEach(vid => {
                        if (vid !== this && !vid.paused) {
                            vid.pause();
                            vid.currentTime = 0; // 重置播放位置
                        }
                    });
                    activeVideos.add(this);
                });
                // 阻止视频控制栏的点击事件冒泡
                video.querySelectorAll('*').forEach(el => {
                    el.addEventListener('click', e => e.stopPropagation());
                });
                // 添加暂停事件监听
                video.addEventListener('pause', function () {
                    activeVideos.delete(this);
                });

                // 视频点击事件处理
                video.addEventListener("click", function (e) {
                    e.stopPropagation();

                    pauseAllVideos();
                    // 显示视频预览，隐藏图片预览
                    previewVideo.classList.remove("d-none");
                    previewImage.classList.add("d-none");

                    // 设置视频源
                    previewVideo.src = this.src;
                    previewVideo.muted = false;

                    // 初始化模态框
                    const modal = new bootstrap.Modal(document.getElementById("imagePreviewModal"));

                    // 显示模态框
                    modal.show();

                    // 尝试自动播放
                    previewVideo.play().catch(err => {
                        console.log("自动播放被阻止:", err);
                    });

                });

                // 添加模态框关闭事件处理
                document.getElementById('imagePreviewModal').addEventListener('hidden.bs.modal', function () {
                    // 暂停预览视频
                    pauseAllVideos();
                    previewVideo.pause();
                    previewVideo.currentTime = 0;
                });

                const cardBody = document.createElement("div");
                cardBody.className = "card-body d-flex flex-column";

                const downloadBtn = document.createElement("button");
                downloadBtn.className = "btn btn-sm btn-primary download-btn";
                downloadBtn.innerHTML = '<i class="bi bi-download"></i> 下载视频';
                downloadBtn.addEventListener("click", (e) => {
                    e.stopPropagation(); // 阻止冒泡到视频点击事件
                    downloadVideo(url); // 使用专用视频下载函数
                });

                cardBody.appendChild(downloadBtn);
                card.appendChild(video);
                card.appendChild(cardBody);
                col.appendChild(card);
                cardContainer.appendChild(col);

                // 添加到活动视频集合
                activeVideos.add(video);
            });

        } catch (error) {
            console.error("获取视频失败:", error);
            cardContainer.innerHTML = `
            <div class="col-12 text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle-fill fs-1"></i>
                <p class="mt-2">加载视频失败，请重试</p>
                <button class="btn btn-outline-primary mt-2" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise"></i> 重新加载
                </button>
            </div>
        `;
        } finally {
            loadingSpinner.classList.add("d-none"); // 隐藏加载动画
        }
    }
    // 跨域图片下载函数
    window.downloadImage = async function (url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("网络响应失败");

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = getFileNameFromURL(url); // 自动命名文件
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (err) {
            alert("下载失败：" + err.message);
            console.error(err);
        }
    };
    // 跨域视频下载函数
    window.downloadVideo = async function (url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("网络响应失败");

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;

            // 使用 getFileNameFromURL 获取文件名，并确保扩展名为 .mp4
            let filename = getFileNameFromURL(url);
            if (!filename.toLowerCase().endsWith(".mp4")) {
                const originalName = filename.split(".")[0] || "video";
                filename = `${originalName}.mp4`;
            }

            a.download = filename;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (err) {
            alert("下载失败：" + err.message);
            console.error(err);
        }
    };
    // 从 URL 提取文件名（带后缀）
    function getFileNameFromURL(url) {
        const filenameRegex = /\/([^\/?#]+)\.?([^\/?#\.]*)$/;
        const matches = url.match(filenameRegex);
        let name = "image";
        let ext = "jpg";

        if (matches && matches[1] && matches[2]) {
            name = matches[1];
            ext = matches[2];
        } else if (matches && matches[1]) {
            name = matches[1];
        }

        return `${name}.${ext}`;
    }


    batchDownloadPicBtn.addEventListener("click", async () => {
        const imageElements = cardContainer.querySelectorAll("img.card-img-top");
        if (imageElements.length === 0) {
            alert("没有可下载的图片");
            return;
        }

        batchDownloadPicBtn.disabled = true;
        batchDownloadPicBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 打包中...';

        const zip = new JSZip();
        const folder = zip.folder("downloaded_images");

        let count = 0;

        for (let i = 0; i < imageElements.length; i++) {
            const url = imageElements[i].src;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`下载失败: ${url}`);

                const blob = await response.blob();
                const filename = getFileNameFromURL(url);

                folder.file(filename, blob, { binary: true });
                count++;
            } catch (err) {
                console.error(err);
            }
        }

        if (count === 0) {
            alert("没有成功下载任何图片");
            batchDownloadPicBtn.disabled = false;
            batchDownloadPicBtn.innerHTML = '<i class="bi bi-download"></i> 批量下载全部图片';
            return;
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "images-batch-download.zip");

        // 恢复按钮状态
        batchDownloadPicBtn.disabled = false;
        batchDownloadPicBtn.innerHTML = '<i class="bi bi-download"></i> 批量下载全部图片';
    });

    batchDownloadVidBtn.addEventListener("click", async () => {
        const videoElements = cardContainer.querySelectorAll("video.card-img-top");
        if (videoElements.length === 0) {
            alert("没有可下载的视频");
            return;
        }

        batchDownloadVidBtn.disabled = true;
        batchDownloadVidBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 打包中...';

        const zip = new JSZip();
        const folder = zip.folder("downloaded_videos");

        let count = 0;

        for (let i = 0; i < videoElements.length; i++) {
            const url = videoElements[i].src;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`下载失败: ${url}`);

                const blob = await response.blob();
                let filename = getFileNameFromURL(url);

                // 确保扩展名为 .mp4
                if (!filename.toLowerCase().endsWith(".mp4")) {
                    const originalName = filename.split(".")[0] || "video";
                    filename = `${originalName}.mp4`;
                }

                folder.file(filename, blob, { binary: true });
                count++;
            } catch (err) {
                console.error(err);
            }
        }

        if (count === 0) {
            alert("没有成功下载任何视频");
            batchDownloadVidBtn.disabled = false;
            batchDownloadVidBtn.innerHTML = '<i class="bi bi-download"></i> 批量下载全部视频';
            return;
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "videos-batch-download.zip");

        // 恢复按钮状态
        batchDownloadVidBtn.disabled = false;
        batchDownloadVidBtn.innerHTML = '<i class="bi bi-download"></i> 批量下载全部视频';
    });


    // 添加点击事件监听器
    const navLinks = [
        { element: picHsLink, api: "https://v2.xxapi.cn/api/heisi" },
        { element: picMnLink, api: "https://v2.xxapi.cn/api/meinvpic" },
        { element: picBsLink, api: "https://v2.xxapi.cn/api/baisi" },
        { element: picMN4PhoneLink, api: "https://v2.xxapi.cn/api/wapmeinvpic" },
        { element: picMN4PCLink, api: "https://v2.xxapi.cn/api/pcmeinvpic" },
        { element: picWallpaperLink, api: "https://v2.xxapi.cn/api/random4kPic?type=wallpaper" },
        { element: vidMNLink, api: "https://v2.xxapi.cn/api/meinv", isVideo: true }
    ];

    navLinks.forEach(({ element, api, isVideo }) => {
        element.addEventListener("click", function (e) {
            e.preventDefault();
            if (isVideo) {
                fetchAndRenderVideos(api);
            } else {
                fetchAndRenderImages(api);
            }
        });
    });
});

