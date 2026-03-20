// 根据日期判断季节
function getSeason(dateString) {
    // 解析日期字符串 "2025.03.30"
    const parts = dateString.split('.');
    const month = parseInt(parts[1]);
    
    if (month >= 3 && month <= 5) return 'spring';  // 春天
    if (month >= 6 && month <= 8) return 'summer';  // 夏天
    if (month >= 9 && month <= 11) return 'autumn'; // 秋天
    return 'winter'; // 冬天 (12, 1, 2月)
}

// 创建季节性动画元素
function createSeasonalEffect(container, season) {
    // 根据季节设置不同的数量
    let effectCount;
    switch(season) {
        case 'spring':
            effectCount = 40; // 春雨更密集
            break;
        case 'winter':
            effectCount = 35; // 雪花更密集
            break;
        default:
            effectCount = 25;
    }
    
    for (let i = 0; i < effectCount; i++) {
        let element;
        
        switch(season) {
            case 'spring':
                // 雨滴 - 白色，更密更大
                element = document.createElement('div');
                element.className = 'raindrop';
                element.style.left = Math.random() * 100 + '%';
                element.style.top = Math.random() * 100 + '%'; // 随机起始高度
                element.style.animationDuration = (Math.random() * 0.8 + 0.8) + 's'; // 0.8-1.6s，更快
                element.style.animationDelay = Math.random() * 3 + 's';
                // 随机长度 - 增大
                element.style.height = (Math.random() * 20 + 25) + 'px'; // 25-45px
                // 随机宽度
                element.style.width = (Math.random() * 1 + 2) + 'px'; // 2-3px
                break;
                
            case 'summer':
                // 花瓣 - 使用logo图片，随机透明度
                element = document.createElement('div');
                element.className = 'petal';
                element.style.left = Math.random() * 100 + '%';
                element.style.top = Math.random() * 100 + '%'; // 随机起始高度
                element.style.animationDuration = (Math.random() * 3 + 4) + 's';
                element.style.animationDelay = Math.random() * 4 + 's';
                // 随机大小 - 增大
                const petalSize = Math.random() * 20 + 35; // 35-55px
                element.style.width = petalSize + 'px';
                element.style.height = petalSize + 'px';
                // 随机透明度
                element.style.opacity = Math.random() * 0.4 + 0.5; // 0.5-0.9
                break;
                
            case 'autumn':
                // 落叶 - 使用logo图片，随机透明度
                element = document.createElement('div');
                element.className = 'leaf';
                element.style.left = Math.random() * 100 + '%';
                element.style.top = Math.random() * 100 + '%'; // 随机起始高度
                element.style.animationDuration = (Math.random() * 3 + 5) + 's';
                element.style.animationDelay = Math.random() * 4 + 's';
                // 随机大小
                const leafSize = Math.random() * 20 + 30; // 30-50px
                element.style.width = leafSize + 'px';
                element.style.height = leafSize + 'px';
                // 随机透明度
                element.style.opacity = Math.random() * 0.5 + 0.4; // 0.4-0.9
                break;
                
            case 'winter':
                // 雪花 - 更大更密
                element = document.createElement('div');
                element.className = 'snowflake';
                element.textContent = '❄';
                element.style.left = Math.random() * 100 + '%';
                element.style.top = Math.random() * 100 + '%'; // 随机起始高度
                element.style.animationDuration = (Math.random() * 3 + 5) + 's';
                element.style.animationDelay = Math.random() * 4 + 's';
                // 随机大小 - 增大
                element.style.fontSize = (Math.random() * 15 + 16) + 'px'; // 16-31px
                // 随机透明度
                element.style.opacity = Math.random() * 0.4 + 0.6; // 0.6-1.0
                break;
        }
        
        if (element) {
            container.appendChild(element);
        }
    }
}

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
            const season = getSeason(photo.date);
            
            html += `
                <section class="page photo-page ${color.colorClass}-bg season-${season}" data-season="${season}">
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
    
    // 为每个照片页添加季节性动画效果
    const photoPages = document.querySelectorAll('.photo-page[data-season]');
    photoPages.forEach(page => {
        const season = page.getAttribute('data-season');
        createSeasonalEffect(page, season);
    });
}

// 音乐播放控制
function initMusicPlayer() {
    const music = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    let isFirstInteraction = true;
    
    // 页面加载完成后立即尝试播放
    const attemptAutoPlay = () => {
        const playPromise = music.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 自动播放成功
                console.log('音乐自动播放成功');
                musicBtn.classList.add('playing');
                musicBtn.classList.remove('paused');
            }).catch(err => {
                // 自动播放被浏览器阻止
                console.log('自动播放被阻止，等待用户交互');
                musicBtn.classList.remove('playing');
                musicBtn.classList.add('paused');
                
                // 监听用户的第一次交互（点击、滚动、触摸等）
                const startMusicOnInteraction = () => {
                    if (isFirstInteraction && music.paused) {
                        music.play().then(() => {
                            musicBtn.classList.add('playing');
                            musicBtn.classList.remove('paused');
                            console.log('用户交互后音乐开始播放');
                        }).catch(e => console.log('播放失败:', e));
                        isFirstInteraction = false;
                    }
                };
                
                // 监听多种交互事件
                document.addEventListener('click', startMusicOnInteraction, { once: true });
                document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
                document.addEventListener('scroll', startMusicOnInteraction, { once: true });
            });
        }
    };
    
    // 等待音频元数据加载完成后尝试播放
    if (music.readyState >= 1) {
        attemptAutoPlay();
    } else {
        music.addEventListener('loadedmetadata', attemptAutoPlay, { once: true });
    }
    
    // 点击按钮切换播放/暂停
    musicBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isFirstInteraction = false; // 防止按钮点击触发自动播放逻辑
        
        if (music.paused) {
            music.play().then(() => {
                musicBtn.classList.add('playing');
                musicBtn.classList.remove('paused');
            }).catch(e => console.log('播放失败:', e));
        } else {
            music.pause();
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('paused');
        }
    });
}

// 平滑滚动和自动吸附功能
document.addEventListener('DOMContentLoaded', function() {
    // 先生成页面内容
    generatePages();
    
    // 初始化音乐播放器
    initMusicPlayer();

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
