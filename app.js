// ==UserScript==
// @name         广东工业大学选课助手 (广工抢课)
// @namespace    http://tampermonkey.net/
// @version      2025-09-23
// @description  try to take over gdut!
// @author       Me
// @match        https://jxfw.gdut.edu.cn/login!welcome.action
// @icon         https://tiebapic.baidu.com/forum/w%3D580%3B/sign=2a1a7a8d23380cd7e61ea2e5917fac34/cf1b9d16fdfaaf5169ba0482ca5494eef01f7ab6.jpg?tbpicau=2025-10-08-05_97d933a2b879cce43be748e5cd945bcc
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    // 配置
    const TABS_CONTAINER_SELECTOR = 'ul.tabs';
    const TAB_ITEM_SELECTOR = 'li';
    const TAB_LINK_SELECTOR = 'a[href="javascript:void(0)"]';
    // 存储已监听的tabs，避免重复监听
    const observedTabs = new Set();
    var currentPage = "";
    var selectList = [];
    var originalTableElement = null;
    function initTabsListener() {
        // 查找所有的tabs容器
        const tabsContainers = document.querySelectorAll(TABS_CONTAINER_SELECTOR);
        tabsContainers.forEach(container => {
            if (!observedTabs.has(container)) {
                setupContainerObserver(container);
                observedTabs.add(container);
                // 初始化已存在的tab项
                initExistingTabs(container);
            }
        });
    }
    function setupContainerObserver(container) {
        // 创建MutationObserver监听容器变化
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    // 检查新增的节点
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1 && node.matches(TAB_ITEM_SELECTOR)) {
                            // 新添加的li元素
                            setTimeout(() => setupTabClickListener(node), 0);
                        }
                    });
                }
            });
        });
        // 开始观察
        observer.observe(container, {
            childList: true,
            subtree: false // 只监听直接子元素变化
        });
    }
    function initExistingTabs(container) {
        // 为容器中已存在的tab项添加监听
        const existingTabs = container.querySelectorAll(TAB_ITEM_SELECTOR);
        existingTabs.forEach(tab => {
            setupTabClickListener(tab);
        });
    }
    function setupTabClickListener(tabElement) {
        // 查找tab中的链接
        const link = tabElement.querySelector(TAB_LINK_SELECTOR);
        if (link && !link.hasAttribute('data-tab-listener')) {
            link.addEventListener('click', function (e) {
                handleTabClick(e, tabElement);
            });
            link.setAttribute('data-tab-listener', 'true');
            const title = getTabTitle(tabElement);
            console.log('已监听tab:', title);
            currentPage = title;
            if (title == "个人选课") {
                handleCourseSelectionTab();
            }
        }
    }
    function handleTabClick(event, tabElement) {
        const tabTitle = getTabTitle(tabElement);
        // 在这里添加你的自定义逻辑
        processTabClick(tabElement, tabTitle);
    }
    function getTabTitle(tabElement) {
        const titleSpan = tabElement.querySelector('.tabs-title');
        return titleSpan ? titleSpan.textContent : '未知标签';
    }
    function processTabClick(tabElement, title) {
        // 你的自定义处理逻辑
        currentPage = title;
        switch (title) {
            case '个人选课':
                handleCourseSelectionTab();
                break;
        }
    }
    // 自定义处理函数
    async function handleCourseSelectionTab() {
        console.log('处理"个人选课"标签');
        if (document.getElementById('tm-datagrid-extractor-window')) {
            console.log("窗口已创建");
            // 窗口已创建，不需要重复创建。关闭窗口只是将窗口隐藏 document.getElementById('tm-datagrid-extractor-window').style.display = '';
            return document.getElementById('tm-datagrid-extractor-window'); // 停止创建窗口，直接返回
        }

        var floatingWindow = document.createElement('div');
        floatingWindow.id = 'tm-datagrid-extractor-window';
        
        // 创建窗口本体
        floatingWindow.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 950px;
            height: 650px;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            overflow: auto;
        `;

        // 创建窗口标题栏
        const windowHeader = document.createElement('div');
        windowHeader.style.cssText = `
            background: #4b6cb7;
            color: white;
            padding: 10px 15px;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        // 创建窗口头
        const windowTitle = document.createElement('div');
        windowTitle.textContent = '广工抢课助手';
        windowTitle.style.fontWeight = 'bold';

        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        windowHeader.appendChild(windowTitle);
        windowHeader.appendChild(closeBtn);

        // 创建窗口内容区域
        const windowBody = document.createElement('div');
        windowBody.style.cssText = `
            padding: 15px;
            flex: 1;
            align-items: start;
            justify-content: start;
        `;

        // 创建表格元素
        const tableElement = document.createElement('div');
        tableElement.style.cssText = `
            overflow - y: auto;
            flex: 1;
            display: flex;
            align - items: start;
            justify - content: start;
        `;

        // 指示文本
        var inputPrompt = document.createElement('td');
        inputPrompt.textContent = "等待表格输入";
        inputPrompt.style.cssText = `
            padding: 10px 0px;
        `;
        
        // 创建提取表格按钮
        const extractButton = document.createElement('button');
        extractButton.textContent = '提取表格';
        extractButton.style.cssText = `
            z-index: 9999;
            padding: 10px 15px;
            background: #4b6cb7;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        // 提取表格函数
        extractButton.addEventListener('click', () => {
            try {
                selectList = [];
                const iframes = document.getElementsByTagName('iframe');
                for (var i = 0; i < iframes.length; i++) {
                    console.log("找到的第", i, "个iframes: ", iframes[i].contentDocument);
                }
                const iframeDocument = iframes[0].contentDocument;
                if (iframeDocument === null) {
                    throw new DOMException("没有获取到iframeDocument元素。")
                }
                console.log("准备尝试提取表格。当前页面：", currentPage);
                if (currentPage !== "个人选课") {
                    console.log("当前不在选课界面!");
                    inputPrompt.textContent = "已取消：当前不在选课界面";
                    return;
                }
                waitForElement(iframeDocument, ".datagrid-btable")
                    .then(element => {
                        console.log('找到元素:', element);
                        // 在这里处理元素
                        originalTableElement = element;
                        if (originalTableElement === null) {
                            console.log('未找到表格！');
                            return;
                        }
                        console.log("已找到表格：", originalTableElement);
                        inputPrompt.textContent = "已找到表格";

                        const count = originalTableElement.children[0].childElementCount; // 原表格的行数

                        // 表格内容为空时，添加样例，此模块可删除
                        if (count == 0) {
                            inputPrompt.textContent += "  提示：表格的内容似乎为空，或需要关闭其他页面 创建了示例表格";
                            const exampleTableRow = document.createElement('tr');
                            exampleTableRow.style.padding = "0px 10px";

                            exampleTableRow.appendChild(createCustomTDString("osu!course: How to play jump map"));
                            exampleTableRow.appendChild(createCustomTDString("40"));
                            exampleTableRow.appendChild(createCustomTDString("mrekk"));
                            exampleTableRow.appendChild(createCustomTDString("限选信息"));
                            exampleTableRow.appendChild(createCustomTDString("已选信息"));
                            exampleTableRow.appendChild(createCustomTDString("osu!"));
                            exampleTableRow.appendChild(createCustomTDString("osu!course"));
                            exampleTableRow.appendChild(createCustomTDString("模拟选课按钮"));

                            const HasSelected = document.createElement('td');
                            HasSelected.textContent = "";

                            const exampleTableElement = document.createElement('table');
                            const exampleTableBody = document.createElement('tbody');
                            exampleTableBody.appendChild(exampleTableRow);

                            exampleTableElement.appendChild(exampleTableBody);

                            originalTableElement = exampleTableElement;
                        }
                        
                        let clonedTable = originalTableElement.cloneNode(true); // 克隆表格以避免影响原表格，使用深度克隆以获取所有子元素
                        let targetTable = document.createElement('table'); // 创建表格元素

                        // 添加表头，表头实际为表格的一行
                        // 某些组件使用函数创建td并使用div包裹，其他组件使用原表格的td
                        const tableRowHeader = document.createElement('tr');
                        tableRowHeader.appendChild(createCustomTDString("索引"));
                        tableRowHeader.appendChild(createCustomTDString("选择"));
                        tableRowHeader.appendChild(createCustomTDString("选课排序"));
                        tableRowHeader.appendChild(createCustomTDString("课程名称"));
                        tableRowHeader.appendChild(createCustomTDString("学分"));
                        tableRowHeader.appendChild(createCustomTDString("教师"));
                        tableRowHeader.appendChild(createCustomTDString("备注"));

                        targetTable.appendChild(tableRowHeader); // 将表头添加到表格

                        // 循环添加表内容
                        for (let i = 0; i < count; i++) {
                            // clonedTable是table，其firstElementChild是table-body，children[i]是第i行
                            const tableTableRow = clonedTable.firstElementChild.children[i]; 
                            //console.log("tableTableRow: ", tableTableRow);

                            // 各种信息在表格中具有固定子元素位置，对应关系如下：
                            // 3: 课程名称在 4: 学分 5: 教师 6: 限选人数 7: 已选人数 8: 课程大类 9: 课程分类 10: 选课操作。0，1，2是空的，暂时不知为何。
                            // 需要获取限选人数和已选人数来判断课程是否已选满。获取的是td内div元素的textContent
                            const courseName = tableTableRow.children[3];
                            const score = tableTableRow.children[4];
                            const teacher = tableTableRow.children[5];
                            const selectLimitCount = tableTableRow.children[6].firstElementChild.textContent; 
                            const hasSelectedCount = tableTableRow.children[7].firstElementChild.textContent;
                            let prompt = "-"; // 对应当前行的‘备注’一列
                            if (selectLimitCount == hasSelectedCount) {
                                prompt = "由于选课人数与限选人数相等，该课程可能无法选择";
                                console.log("由于选课人数与限选人数相等，可能永远无法选择课程。当前选课序号：", i)
                            }

                            // 添加选课排序输入控件
                            const orderIndexControl = document.createElement('input');
                            orderIndexControl.disabled = true; // 选中该课程时才会启用
                            orderIndexControl.addEventListener('input', function () {
                                let target = orderIndexControl.value; 
                                if (target < selectList.length) { // 神之javascript不需要我转换类型
                                    //orderIndexControl.style.borderColor = "#EB1F61";
                                    let original = selectList.indexOf(i);
                                    console.log("交换列表 ", target, " 和 ", original, " 的位置");
                                    [selectList[target], selectList[original]] = [selectList[original], selectList[target]];
                                }
                                else {
                                    //orderIndexControl.style.borderInlineColor = "#EB1F61"
                                }
                            });

                            // 添加是否选择课程控件
                            const checkBoxControl = document.createElement('input');
                            checkBoxControl.type = "checkbox";
                            checkBoxControl.addEventListener('change', function () {
                                if (this.checked) {
                                    addTableRow.style.backgroundColor = '#FFFED9'
                                    let index = selectList.indexOf(i);
                                    if (index == -1) {
                                        console.log("添加序号 ", i, " 到选择列表末尾");
                                        selectList.push(i);
                                    }
                                    if (orderIndexControl.value != "") {
                                        //console.log("序号控制的内容不为空！读取到：", orderIndexControl.value);
                                        let target = parseInt(orderIndexControl.value);
                                        let original = i;
                                        if (target < selectList.length) {
                                            //console.log("交换列表 ", target, " 和 ", original, " 的位置");
                                            //let temp = selectList[target];
                                            //selectList[target] = selectList[original];
                                            //selectList[original] = temp;
                                        }
                                    }
                                    orderIndexControl.value = i;
                                    orderIndexControl.disabled = false;
                                    
                                }
                                else {
                                    addTableRow.style.backgroundColor = '#FFFFFF'
                                    if (i % 2 == 0) {
                                        addTableRow.style.backgroundColor = '#F5F5F5';
                                    }
                                    let index = selectList.indexOf(i);
                                    if (index !== -1) {
                                        selectList.splice(index, 1);
                                    }
                                    orderIndexControl.disabled = true;
                                }
                                console.log("当前选择列表：", selectList);
                            });

                            const addTableRow = document.createElement('tr'); // 新建一行

                            // 将各组件添加到新建的一行
                            // 某些组件使用函数创建td并使用div包裹，其他组件使用原表格的td
                            addTableRow.appendChild(createCustomTDString(i + 1)); 
                            addTableRow.appendChild(createCustomTDElement(checkBoxControl));
                            addTableRow.appendChild(createCustomTDElement(orderIndexControl));
                            addTableRow.appendChild(courseName);
                            addTableRow.appendChild(score);
                            addTableRow.appendChild(teacher);
                            addTableRow.appendChild(createCustomTDString(prompt, "12px"));

                            if (i % 2 == 0) addTableRow.style.backgroundColor = '#F5F5F5'; // 行数为偶数时上色，使表格易读

                            targetTable.appendChild(addTableRow); // 将新建的一行添加到表格
                        }
                        // 为表格添加一些基本样式
                        targetTable.style.width = '100%';
                        targetTable.style.borderCollapse = 'collapse';
                        targetTable.style.margin = '0';

                        // 为表格单元格添加样式
                        const cells = targetTable.getElementsByTagName('td');
                        const headers = targetTable.getElementsByTagName('th');
                        for (var cell of cells) {
                            cell.style.border = '1px solid #ddd';
                            cell.style.padding = '10px';
                        }
                        tableElement.innerHTML = '';
                        tableElement.style.padding = '15px 0px';
                        tableElement.appendChild(targetTable);
                        windowBody.appendChild(tableElement);
                    })
                    .catch(error => {
                        console.error('等待元素超时:', error);
                    });
                
            }
            catch (ex) {
                inputPrompt.textContent = ex;
            }
        });
        
        const inputConsole = document.createElement('div');
        inputConsole.style.padding = "0px 0px";
        inputConsole.appendChild(extractButton);
        inputConsole.appendChild(inputPrompt);

        var excutePrompt = document.createElement('td');
        excutePrompt.textContent = "";
        excutePrompt.style.cssText = `
            padding: 10px 0px;
        `;

        const startSelectButton = document.createElement('button');
        startSelectButton.textContent = '开始抢课';
        startSelectButton.style.cssText = `
            z-index: 9999;
            padding: 10px 15px;
            background: #4b6cb7;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        var doSelectingCourse = false;
        startSelectButton.addEventListener('click', async () => {
            console.log("###  准备尝试抢课。当前页面：", currentPage);
            if (currentPage !== "个人选课") {
                console.log("当前不在选课界面！");
                excutePrompt.textContent = "已取消：当前不在选课界面";
                return;
            }
            if (originalTableElement === null) {
                excutePrompt.textContent = "已取消：还未获取到原始表格";
                return;
            }
            if (selectList.length == 0) {
                excutePrompt.textContent = "已取消：当前还没有勾选要选择的课程";
                return;
            }
            if (doSelectingCourse) {
                startSelectButton.textContent = '开始抢课';
                stopSelecting();
                // 清除所有监听器和定时器
                if (window.iframeObserver) {
                    window.iframeObserver.disconnect();
                }
                if (window.selectCourseInterval) {
                    clearInterval(window.selectCourseInterval);
                }
                return;
            }
            else {
                doSelectingCourse = true;
                excutePrompt.textContent = "即将开始抢课";
                startSelectButton.textContent = '停止抢课';
            }
            const iframe = document.getElementsByTagName('iframe')[0];

            // 监听iframe本身的加载完成事件
            iframe.addEventListener('load', onIframeLoaded);
            const iframeDocument = iframe.contentDocument;

            // 开始检测流程，检测iframe，选课按钮，刷新按钮
            startDetection();

            async function startDetection() {
                if (!doSelectingCourse) return;

                // 每次检测都重新获取iframeDocument，因为刷新后的iframe是新的
                let iframeDocument;
                try {
                    iframeDocument = iframe.contentDocument;
                } catch (e) {
                    console.error("无法访问iframe内容:", e);
                    setTimeout(startDetection, 1000);
                    return;
                }
                if (!iframeDocument) {
                    console.log("iframe文档未加载完成，等待后重试");
                    setTimeout(startDetection, 500);
                    return;
                }
                var isSelectingTime = await detectCourseSelectionStatue();
                console.log("isSelectingTime: ", isSelectingTime);
                 
                const selectRow = originalTableElement.firstElementChild.children[selectList[0]];
                if (selectRow) {
                    console.log("selectRow: ", selectRow);
                    console.log("")
                    const selectButton = selectRow.children[10].children[0].children[1];
                    if (selectButton) {
                        console.log("selectButton: ", selectButton);
                        console.log("找到选课按钮，执行选课");
                        selectButton.click();
                        excutePrompt.textContent = ("找到选课按钮，执行选课，点击选课按钮");
                        waitForElement(iframeDocument, ".messager-button").then(element => {
                            console.log("找到确定按钮：", element);
                            element.firstElementChild.click();
                        }).catch(error => {
                            console.log("等待元素超时：", error);

                        });
                        
                        stopSelecting();
                        return;
                    }
                    else {
                        console.log("序号为 ", selectList[0], " 的选课按钮未找到，即将重试");
                        excutePrompt.textContent = ("序号为 " + selectList[0] + " 的选课按钮未找到，即将重试");
                    }
                }
                else {
                    console.log("selectRow不存在")
                }
                console.log("现在不是选课时间或选课失败，即将继续");
                excutePrompt.textContent = ("现在不是选课时间或选课失败，即将继续");
                
                // 2. 检查并点击刷新按钮
                const refreshButton = iframeDocument.querySelector('.easyui-linkbutton.l-btn');
                if (refreshButton) {
                    console.log("点击刷新按钮");
                    refreshButton.click();

                    // 刷新后iframe会重新加载，等待onIframeLoaded事件
                } else {
                    // 如果刷新按钮不存在，等待后重试
                    console.log("刷新按钮未找到，等待后重试");
                    excutePrompt.textContent = "刷新按钮未找到，等待后重试";
                    setTimeout(startDetection, 1000);
                }
            }

            function onIframeLoaded() {
                if (!doSelectingCourse) return;
                console.log("iframe加载完成，继续检测");
                console.log("iframe: ", iframe.cloneNode(true));
                //excutePrompt.textContent = "iframe加载完成，继续检测";
                // 给iframe内容一些时间完全加载
                setTimeout(() => {
                    startDetection();
                }, 100);
            }

            function stopSelecting() {
                doSelectingCourse = false;
                startSelectButton.textContent = '开始抢课';
                const iframe = document.getElementsByTagName('iframe')[0];
                iframe.removeEventListener('load', onIframeLoaded);

                if (window.selectCourseInterval) {
                    clearInterval(window.selectCourseInterval);
                }
            }
        }
        );

        const excuteConsole = document.createElement('div');
        excuteConsole.style.padding = "0px 0px";
        excuteConsole.appendChild(startSelectButton);
        excuteConsole.appendChild(excutePrompt);

        windowBody.appendChild(inputConsole);
        windowBody.appendChild(excuteConsole);
        floatingWindow.appendChild(windowHeader);
        floatingWindow.appendChild(windowBody);


        // 关闭窗口
        closeBtn.addEventListener('click', () => {
            floatingWindow.style.display = 'none';
        });

        // 使窗口可拖拽
        let isDragging = false;
        let initialX, initialY;

        windowHeader.addEventListener('mousedown', dragStart);

        function dragStart(e) {
            initialX = e.clientX - floatingWindow.offsetLeft;
            initialY = e.clientY - floatingWindow.offsetTop;
            isDragging = true;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                floatingWindow.style.left = (e.clientX - initialX) + 'px';
                floatingWindow.style.top = (e.clientY - initialY) + 'px';
            }
        }

        function dragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
            if (floatingWindow.style.left.slice(0, -2) < -300) {
                console.log("left");
                floatingWindow.style.left = '-300px';
            }
            if (floatingWindow.style.top.slice(0, -2) < 0) {
                console.log("top");
                floatingWindow.style.top = '0px';
            }
        }
        // 将浮动窗口添加到body中
        document.body.appendChild(floatingWindow);
        return;
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabsListener);
    } else {
        setTimeout(initTabsListener, 100);
    }

    async function detectCourseSelectionStatue() {
        try {
            const iframe = document.getElementsByTagName('iframe')[0];
            const iframeDocument = iframe.contentDocument;

            iframe.onload = function () {
                if (iframeDocument === null) {
                    throw new DOMException("没有获取到iframeDocument元素。")
                }
                waitForElement(iframe.contentDocument, "#header")
                .then(element => {
                    console.log('成功找到元素:', element);
                    // 在这里执行您的操作
                    var text = element.textContent;
                    if (text.startsWith("现在不是选课时间")) {
                        console.log("检测到标签：现在不是选课时间");
                        return false;
                    }
                    console.log("未检测到标签：现在不是选课时间");
                    return true;
                })
                    .catch(error => {
                        excutePrompt.textContent = error.message;
                        console.error('错误:', error.message);
                });
            }

        }
        catch (ex) {
            console.log("获取元素时错误，可能没有此元素。", ex);
            return false;
        }
    }
    function waitForElement(doc, elementId, maxAttempts = 20, interval = 100) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const element = doc.querySelector(elementId);

            const checkElement = () => {
                console.log("要检查的iframe: ", doc);
                attempts++;
                if (element) {
                    resolve(element);
                } else if (attempts < maxAttempts) {
                    setTimeout(checkElement, interval);
                } else {
                    reject(new Error(`id为： ${elementId} 的元素在指定时间：` + interval + ` 内未找到`));
                }
            };

            checkElement();
        });
    }

    function createCustomTDString(content, size = "15px") {
        const tdElement = document.createElement('td');
        const divElement = document.createElement('div');
        divElement.textContent = content;
        divElement.style.fontSize = size;
        tdElement.appendChild(divElement);
        return tdElement;
    }

    function createCustomTDElement(element) {
        const tdElement = document.createElement('td');
        const divElement = document.createElement('div');
        divElement.appendChild(element);
        tdElement.appendChild(divElement);
        return tdElement;
    }
}
)();