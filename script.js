document.addEventListener('DOMContentLoaded', () => {
    loadForbiddenWordsWithLabels(); // 调用加载包含完整标签的禁止词函数
    document.getElementById('checkButton').addEventListener('click', checkForbiddenWords); // 为按钮添加点击事件，执行检查函数
});

let forbiddenWordsWithLabels = []; // 定义一个数组用于存储包含标签的禁止词

// 加载包含完整标签的禁止词表函数
async function loadForbiddenWordsWithLabels() {
    try {
        // 从 JSON 文件中获取禁止词和对应的完整标签
        const response = await fetch('异形词.json');
        if (!response.ok) throw new Error(`HTTP 错误！状态：${response.status}`);
        
        // 解析 JSON 文件并保存到数组中
        forbiddenWordsWithLabels = await response.json();
        console.log('加载的包含完整标签的禁止词表:', forbiddenWordsWithLabels);
        document.getElementById('loadStatus').textContent = '词表加载成功'; // 更新加载状态
    } catch (error) {
        // 若加载失败，输出错误信息并通知用户
        console.error('加载禁止词标签文件失败:', error);
        alert('加载标签文件失败，请稍后再试。');
        document.getElementById('loadStatus').textContent = '词表加载失败。'; // 更新加载状态
    }
}

// 修改后的检查禁止词函数，用于显示包含完整标签的检测结果
function checkForbiddenWords() {
    const textInput = document.getElementById('textInput').value; // 获取用户输入的文本
    let resultHTML = escapeHtml(textInput); // 对输入文本进行 HTML 转义，防止代码注入
    let detectedWords = new Set(); // 创建一个集合用于存储检测到的禁止词
    let detectedLabels = []; // 创建一个数组用于存储检测到的词及其对应完整标签

    // 遍历禁止词表，检查输入文本中是否包含禁止词
    forbiddenWordsWithLabels.forEach(({ word, full_label }) => {
        const regex = new RegExp(`${escapeRegExp(word)}`, 'gi'); // 创建正则表达式用于匹配词语
        if (regex.test(textInput)) {
            detectedWords.add(word); // 将匹配到的禁止词加入集合
            detectedLabels.push({ word, label: full_label }); // 将词和完整标签加入到数组中
            resultHTML = resultHTML.replace(regex, `<span class="highlight">${word}</span>`); // 高亮显示匹配到的禁止词
        }
    });

    document.getElementById('result').innerHTML = resultHTML; // 将处理后的文本显示在页面上
    displayDetectedWords(detectedLabels); // 显示检测到的词及其对应完整标签
}

// 显示检测到的词及其标签的函数
function displayDetectedWords(detectedLabels) {
    const detectedWordsDiv = document.getElementById('detectedWords'); // 获取显示检测词的元素
    const wordList = document.getElementById('wordList'); // 获取列表元素
    wordList.innerHTML = ''; // 清空列表内容

    // 如果有检测到的词，则遍历添加到列表中
    if (detectedLabels.length > 0) {
        detectedLabels.forEach(({ word, label }) => {
            const listItem = document.createElement('li'); // 创建列表项
            listItem.textContent = `${word} - 注意: ${label}`; // 设置列表项内容为“词 - 标签 (A-B-C 格式)”
            wordList.appendChild(listItem); // 将列表项添加到列表中
        });
        detectedWordsDiv.style.display = 'block'; // 显示检测词的区域
    } else {
        detectedWordsDiv.style.display = 'none'; // 若无检测词，隐藏该区域
    }
}

// HTML 转义函数，防止代码注入
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 转义正则表达式中的特殊字符函数
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
