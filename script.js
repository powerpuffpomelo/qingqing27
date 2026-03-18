// 动态生成页面内容
function generatePages() {
    const container = document.querySelector('.container');
    let html = '';

    // 首页
    html += `
        <section class="page intro-page">
            <div class="content">
                <h1 class="rainbow-text">${albumConfig.title.line1}</h1>
                <h2 class="rainbow-text">${albumConfig.title.line2}</h2>
                <div class="scroll-hint">↓</div>
            </div>
        </section>
    `;

    // 遍历每个颜色章节
    albumConfig.colors.forEach(color => {
        // 颜色标题页
        html += `
            <section class="page color-intro ${color.colorClass}-intro">
                <div class="color-title">${color.name}</div>
            </section>
        `;

        // 该颜色的所有照片页
        color.photos.forEach(photo => {
            // 自动检测图片扩展名（支持jpg和png）
            const imgPath = `images/${color.colorClass}/${photo.filename}`;
            html += `
                <section class="page photo-page ${color.colorClass}-bg">
                    <img src="${imgPath}.jpg" 
                         onerror="this.onerror=null; this.src='${imgPath}.png';" 
                         alt="${color.name}色回忆">
                    <div class="caption">
                        <div class="date">${photo.date}</div>
                        <div class="text">${photo.text}</div>
                    </div>
                </section>
            `;
        });
    });

    // 结尾页
    html += `
        <section class="page ending-page">
            <div class="content">
                <h2 class="date-range">${albumConfig.ending.dateRange}</h2>
                <h1 class="blessing">${albumConfig.ending.blessing1}</h1>
                <h2 class="blessing">${albumConfig.ending.blessing2}</h2>
                <h1 class="age">${albumConfig.ending.age}</h1>
                <h2 class="blessing">${albumConfig.ending.blessing3}</h2>
                <div class="heart">♥</div>
            </div>
        </section>
    `;

    container.innerHTML = html;
}

// 平滑滚动和自动吸附功能
document.addEventListener('DOMContentLoaded', function() {
    // 先生成页面内容
    generatePages();

    const container = document.querySelector('.container');
    const pages = document.querySelectorAll('.page');
    let isScrolling = false;
    let currentPage = 0;

    // 监听滚轮事件
    container.addEventListener('wheel', function(e) {
        if (isScrolling) return;
        
        e.preventDefault();
        isScrolling = true;

        if (e.deltaY > 0 && currentPage < pages.length - 1) {
            // 向下滚动
            currentPage++;
        } else if (e.deltaY < 0 && currentPage > 0) {
            // 向上滚动
            currentPage--;
        }

        pages[currentPage].scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }, { passive: false });

    // 触摸滑动支持（移动端）
    let touchStartY = 0;
    let touchEndY = 0;

    container.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
        if (isScrolling) return;
        
        touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) {
            isScrolling = true;

            if (diff > 0 && currentPage < pages.length - 1) {
                currentPage++;
            } else if (diff < 0 && currentPage > 0) {
                currentPage--;
            }

            pages[currentPage].scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }, { passive: true });

    // 键盘导航
    document.addEventListener('keydown', function(e) {
        if (isScrolling) return;

        if ((e.key === 'ArrowDown' || e.key === 'PageDown') && currentPage < pages.length - 1) {
            isScrolling = true;
            currentPage++;
            pages[currentPage].scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { isScrolling = false; }, 1000);
        } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && currentPage > 0) {
            isScrolling = true;
            currentPage--;
            pages[currentPage].scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { isScrolling = false; }, 1000);
        }
    });

    // 监听实际滚动位置，更新当前页码
    let scrollTimeout;
    container.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPosition = container.scrollTop;
            const pageHeight = window.innerHeight;
            currentPage = Math.round(scrollPosition / pageHeight);
        }, 100);
    });
});
