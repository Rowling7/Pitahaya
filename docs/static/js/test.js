// 检测内容是否超出容器
document.querySelectorAll('.snap-section').forEach(section => {
  if (section.scrollHeight > section.clientHeight) {
    section.classList.add('has-more-content');

    // 添加滚动事件监听器
    section.addEventListener('scroll', function () {
      // 添加滚动中类
      this.classList.add('scrolling');

      // 滚动结束后移除类
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.classList.remove('scrolling');
      }, 300);

      // 当接近底部时，允许整体滚动
      if (this.scrollTop + this.clientHeight >= this.scrollHeight - 50) {
        this.classList.add('allow-snap');
      } else {
        this.classList.remove('allow-snap');
      }
    });
  }
});

// 平滑滚动到顶部
document.querySelectorAll('.snap-section').forEach(section => {
  const scrollTopButton = document.createElement('button');
  scrollTopButton.className = 'scroll-top-button';
  scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  scrollTopButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 100;
  `;

  section.appendChild(scrollTopButton);

  section.addEventListener('scroll', function () {
    if (this.scrollTop > 100) {
      scrollTopButton.style.opacity = '1';
      scrollTopButton.style.visibility = 'visible';
    } else {
      scrollTopButton.style.opacity = '0';
      scrollTopButton.style.visibility = 'hidden';
    }
  });

  scrollTopButton.addEventListener('click', () => {
    section.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});    