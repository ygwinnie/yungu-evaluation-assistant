// ==UserScript==
// @name         批量操作面板-保存提交编辑
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  批量操作面板：保存下一个、提交下一个、编辑按钮
// @author       You
// @match        https://task.yungu.org/*
// @match        https://evaluation.yungu.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('[批量操作] 脚本开始加载...');

    // 创建按钮容器和三个按钮
    function createButtonPanel() {
        // 创建容器
        const panel = document.createElement('div');
        panel.id = 'action-panel';
        panel.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 80px;
            z-index: 999999;
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            cursor: move;
            user-select: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 140px;
        `;
        
        // 创建标题
        const title = document.createElement('div');
        title.textContent = '批量操作';
        title.style.cssText = `
            color: white;
            font-size: 12px;
            text-align: center;
            margin-bottom: 5px;
            font-weight: bold;
        `;
        panel.appendChild(title);
        
        // 创建三个按钮
        const buttons = [
            { text: '保存下一个', color: '#1890ff', action: 'save' },
            { text: '提交下一个', color: '#52c41a', action: 'submit' },
            { text: '编辑', color: '#faad14', action: 'edit' }
        ];
        
        buttons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.textContent = btnConfig.text;
            btn.style.cssText = `
                padding: 8px 12px;
                background-color: ${btnConfig.color};
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: bold;
                transition: all 0.2s ease;
                width: 100%;
            `;
            
            // 悬停效果
            btn.addEventListener('mouseover', () => {
                btn.style.backgroundColor = adjustColor(btnConfig.color, -10);
                btn.style.transform = 'scale(1.05)';
            });
            
            btn.addEventListener('mouseout', () => {
                btn.style.backgroundColor = btnConfig.color;
                btn.style.transform = 'scale(1)';
            });
            
            // 绑定点击事件
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止触发拖拽
                console.log(`[批量操作] ${btnConfig.text}按钮被点击`);
                
                if (btnConfig.action === 'save') {
                    saveAndNext();
                } else if (btnConfig.action === 'submit') {
                    submitAndNext();
                } else if (btnConfig.action === 'edit') {
                    clickEditButton();
                }
            });
            
            panel.appendChild(btn);
        });
        
        return panel;
    }

    // 辅助函数：调整颜色
    function adjustColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + percent));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent));
        return "#" + (((1 << 24) + (r << 16) + (g << 8) + b) | 0).toString(16).slice(1);
    }

    // 显示通知函数
    function showNotification(message, type) {
        console.log(`[批量操作] ${message}`);
        
        const notification = document.createElement('div');
        notification.textContent = message;
        
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.backgroundColor = type === 'error' ? '#f5222d' : type === 'success' ? '#52c41a' : '#1890ff';
        notification.style.color = 'white';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '10000';
        notification.style.fontSize = '14px';
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // React兼容点击函数 - 增强版，包含子元素点击
    function triggerClick(element) {
        if (!element) return false;
        
        console.log('[批量操作] 开始执行增强点击事件');
        
        // 1. 聚焦元素
        if (element.focus) {
            element.focus();
        }
        
        // 2. 创建更完整的鼠标事件
        const eventOptions = {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: element.getBoundingClientRect().left + element.offsetWidth / 2,
            clientY: element.getBoundingClientRect().top + element.offsetHeight / 2,
            button: 0,
            buttons: 1,
            detail: 1
        };
        
        // 3. 触发完整的事件序列
        const mouseOver = new MouseEvent('mouseover', eventOptions);
        const mouseMove = new MouseEvent('mousemove', eventOptions);
        const mouseDown = new MouseEvent('mousedown', eventOptions);
        const mouseUp = new MouseEvent('mouseup', eventOptions);
        const click = new MouseEvent('click', eventOptions);
        const mouseOut = new MouseEvent('mouseout', eventOptions);
        
        // 4. 按顺序触发所有事件
        element.dispatchEvent(mouseOver);
        element.dispatchEvent(mouseMove);
        element.dispatchEvent(mouseDown);
        element.dispatchEvent(mouseUp);
        element.dispatchEvent(click);
        element.dispatchEvent(mouseOut);
        
        // 5. 原生点击作为备用
        element.click();
        
        // 6. 重点：尝试点击学生姓名子元素
        const studentName = element.querySelector('.stuName___3w8FX');
        if (studentName) {
            console.log('[批量操作] 找到学生姓名元素，尝试点击:', studentName.textContent);
            
            const nameEventOptions = {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: studentName.getBoundingClientRect().left + studentName.offsetWidth / 2,
                clientY: studentName.getBoundingClientRect().top + studentName.offsetHeight / 2,
                button: 0,
                buttons: 1,
                detail: 1
            };
            
            // 对姓名元素执行完整的点击事件
            studentName.dispatchEvent(new MouseEvent('mouseover', nameEventOptions));
            studentName.dispatchEvent(new MouseEvent('mousedown', nameEventOptions));
            studentName.dispatchEvent(new MouseEvent('mouseup', nameEventOptions));
            studentName.dispatchEvent(new MouseEvent('click', nameEventOptions));
            studentName.click();
            
            console.log('[批量操作] 学生姓名元素点击完成');
        } else {
            console.log('[批量操作] 未找到学生姓名元素');
        }
        
        // 7. 如果有其他子元素，也尝试点击
        const clickableChild = element.querySelector('label, div[class*="inline"]');
        if (clickableChild && clickableChild !== studentName) {
            console.log('[批量操作] 尝试点击其他子元素:', clickableChild);
            clickableChild.dispatchEvent(new MouseEvent('click', eventOptions));
            clickableChild.click();
        }
        
        // 8. 触发变化事件
        const changeEvent = new Event('change', { bubbles: true });
        element.dispatchEvent(changeEvent);
        
        console.log('[批量操作] 增强点击事件执行完成');
        return true;
    }

    // 查找保存按钮
    function findSaveButton() {
        const buttons = document.querySelectorAll('button.ant-btn.ant-btn-round.ant-btn-lg');
        for (let i = 0; i < buttons.length; i++) {
            const span = buttons[i].querySelector('span');
            if (span && span.textContent.trim() === '保 存') {
                return buttons[i];
            }
        }
        return null;
    }

    // 查找提交按钮
    function findSubmitButton() {
        const buttons = document.querySelectorAll('button.ant-btn.ant-btn-primary.ant-btn-round.ant-btn-lg');
        for (let i = 0; i < buttons.length; i++) {
            const span = buttons[i].querySelector('span');
            if (span && span.textContent.trim() === '提 交') {
                return buttons[i];
            }
        }
        return null;
    }

    // 查找编辑按钮
    function findEditButton() {
        const buttons = document.querySelectorAll('button.ant-btn.ant-btn-primary.ant-btn-round.ant-btn-lg');
        for (let i = 0; i < buttons.length; i++) {
            const span = buttons[i].querySelector('span');
            if (span && span.textContent.trim() === '编 辑') {
                return buttons[i];
            }
        }
        return null;
    }

    // 查找下一个学生（在保存前获取当前学生的索引）
    function getCurrentStudentIndex() {
        const allStudents = document.querySelectorAll('.studentList___1wvec');
        console.log('[批量操作] 找到学生总数:', allStudents.length);
        
        for (let i = 0; i < allStudents.length; i++) {
            const student = allStudents[i];
            if (student.classList.contains('stuCheck___nZzmU')) {
                console.log('[批量操作] 当前学生索引:', i);
                return i;
            }
        }
        
        console.log('[批量操作] 未找到当前选中学生');
        return -1;
    }

    // 根据索引查找下一个学生（保存后重新获取）
    function findNextStudentByIndex(currentIndex) {
        // 重新获取最新的学生列表
        const allStudents = document.querySelectorAll('.studentList___1wvec');
        console.log('[批量操作] 保存后重新获取学生总数:', allStudents.length);
        console.log('[批量操作] 目标下一个学生索引:', currentIndex + 1);
        
        if (currentIndex >= 0 && currentIndex + 1 < allStudents.length) {
            const nextStudent = allStudents[currentIndex + 1];
            console.log('[批量操作] 找到下一个学生:', nextStudent);
            return nextStudent;
        } else {
            console.log('[批量操作] 已经是最后一个学生或索引无效');
            return null;
        }
    }

    // 主要功能函数
    function saveAndNext() {
        showNotification('开始保存下一个操作...', 'info');
        
        // 第零步：获取当前学生的索引（在保存前获取）
        const currentIndex = getCurrentStudentIndex();
        if (currentIndex === -1) {
            showNotification('无法确定当前学生位置', 'error');
            return;
        }
        console.log('[保存下一个] 保存前记录的当前学生索引:', currentIndex);
        
        // 第一步：点击保存
        const saveButton = findSaveButton();
        if (!saveButton) {
            showNotification('未找到保存按钮', 'error');
            return;
        }
        
        showNotification('找到保存按钮，正在保存...', 'info');
        triggerClick(saveButton);
        
        // 第二步：等待保存完成后，重新获取学生列表并切换
        setTimeout(function() {
            // 使用保存前的索引，重新获取下一个学生
            const nextStudent = findNextStudentByIndex(currentIndex);
            if (!nextStudent) {
                showNotification('未找到下一个学生或已是最后一个', 'error');
                return;
            }
            
            showNotification('重新获取到下一个学生，正在切换...', 'info');
            
            // 记录切换前的当前学生（重新获取）
            const beforeSwitch = document.querySelector('.studentList___1wvec.stuCheck___nZzmU');
            console.log('[保存下一个] 切换前的当前学生:', beforeSwitch);
            
            // 高亮显示下一个学生
            nextStudent.style.border = '2px solid red';
            setTimeout(function() {
                nextStudent.style.border = '';
            }, 3000);
            
            // 执行点击
            triggerClick(nextStudent);
            
            // 验证切换是否成功
            setTimeout(function() {
                const afterSwitch = document.querySelector('.studentList___1wvec.stuCheck___nZzmU');
                console.log('[保存下一个] 切换后的当前学生:', afterSwitch);
                
                if (afterSwitch && afterSwitch !== beforeSwitch) {
                    showNotification('✅ 保存下一个操作完成！学生切换成功', 'success');
                } else {
                    showNotification('⚠️ 保存完成，但学生切换可能失败', 'error');
                    console.log('[保存下一个] 学生切换验证失败，尝试其他方法...');
                    
                    // 尝试第二种点击方法：重点点击学生姓名
                    setTimeout(function() {
                        console.log('[保存下一个] 第一次点击失败，尝试专门点击学生姓名');
                        
                        // 重新获取最新的下一个学生元素
                        const freshNextStudent = findNextStudentByIndex(currentIndex);
                        if (!freshNextStudent) {
                            showNotification('❌ 无法重新获取下一个学生元素', 'error');
                            return;
                        }
                        
                        // 专门查找学生姓名元素
                        const studentNameElement = freshNextStudent.querySelector('.stuName___3w8FX');
                        if (studentNameElement) {
                            console.log('[保存下一个] 找到学生姓名元素:', studentNameElement.textContent);
                            showNotification(`尝试点击学生: ${studentNameElement.textContent}`, 'info');
                            
                            // 高亮姓名元素
                            studentNameElement.style.backgroundColor = 'yellow';
                            setTimeout(function() {
                                studentNameElement.style.backgroundColor = '';
                            }, 2000);
                            
                            // 专门对姓名元素执行点击
                            const nameRect = studentNameElement.getBoundingClientRect();
                            const clickEvent = new MouseEvent('click', {
                                view: window,
                                bubbles: true,
                                cancelable: true,
                                clientX: nameRect.left + nameRect.width / 2,
                                clientY: nameRect.top + nameRect.height / 2,
                                button: 0,
                                buttons: 1
                            });
                            
                            studentNameElement.dispatchEvent(clickEvent);
                            studentNameElement.click();
                            
                            // 最终验证
                            setTimeout(function() {
                                const finalCheck = document.querySelector('.studentList___1wvec.stuCheck___nZzmU');
                                if (finalCheck && finalCheck !== beforeSwitch) {
                                    showNotification('✅ 点击学生姓名成功！学生切换完成', 'success');
                                } else {
                                    showNotification('❌ 多次尝试失败，请手动点击学生切换', 'error');
                                    console.log('[保存下一个] 所有自动切换方法都失败了');
                                }
                            }, 1000);
                            
                        } else {
                            console.log('[保存下一个] 未找到学生姓名元素');
                            showNotification('❌ 未找到学生姓名元素，请手动切换', 'error');
                        }
                        
                    }, 1000);
                }
            }, 1000);
            
        }, 2000); // 增加等待时间到2秒，确保React重新渲染完成
    }

    // 提交下一个功能（复用保存下一个的逻辑，但点击提交按钮）
    function submitAndNext() {
        showNotification('开始执行提交下一个操作...', 'info');
        
        // 第零步：获取当前学生的索引（在提交前获取）
        const currentIndex = getCurrentStudentIndex();
        if (currentIndex === -1) {
            showNotification('无法确定当前学生位置', 'error');
            return;
        }
        console.log('[提交下一个] 提交前记录的当前学生索引:', currentIndex);
        
        // 第一步：点击提交
        const submitButton = findSubmitButton();
        if (!submitButton) {
            showNotification('未找到提交按钮', 'error');
            return;
        }
        
        showNotification('找到提交按钮，正在提交...', 'info');
        triggerClick(submitButton);
        
        // 第二步：等待提交完成后，重新获取学生列表并切换（逻辑与保存下一个相同）
        setTimeout(function() {
            const nextStudent = findNextStudentByIndex(currentIndex);
            if (!nextStudent) {
                showNotification('未找到下一个学生或已是最后一个', 'error');
                return;
            }
            
            showNotification('重新获取到下一个学生，正在切换...', 'info');
            
            const beforeSwitch = document.querySelector('.studentList___1wvec.stuCheck___nZzmU');
            console.log('[提交下一个] 切换前的当前学生:', beforeSwitch);
            
            nextStudent.style.border = '2px solid green';
            setTimeout(function() {
                nextStudent.style.border = '';
            }, 3000);
            
            triggerClick(nextStudent);
            
            setTimeout(function() {
                const afterSwitch = document.querySelector('.studentList___1wvec.stuCheck___nZzmU');
                console.log('[提交下一个] 切换后的当前学生:', afterSwitch);
                
                if (afterSwitch && afterSwitch !== beforeSwitch) {
                    showNotification('✅ 提交下一个操作完成！学生切换成功', 'success');
                } else {
                    showNotification('⚠️ 提交完成，但学生切换可能失败', 'error');
                    console.log('[提交下一个] 学生切换验证失败，尝试其他方法...');
                    
                    setTimeout(function() {
                        console.log('[提交下一个] 第一次点击失败，尝试专门点击学生姓名');
                        
                        const freshNextStudent = findNextStudentByIndex(currentIndex);
                        if (!freshNextStudent) {
                            showNotification('❌ 无法重新获取下一个学生元素', 'error');
                            return;
                        }
                        
                        const studentNameElement = freshNextStudent.querySelector('.stuName___3w8FX');
                        if (studentNameElement) {
                            console.log('[提交下一个] 找到学生姓名元素:', studentNameElement.textContent);
                            showNotification(`尝试点击学生: ${studentNameElement.textContent}`, 'info');
                            
                            studentNameElement.style.backgroundColor = 'lightgreen';
                            setTimeout(function() {
                                studentNameElement.style.backgroundColor = '';
                            }, 2000);
                            
                            const nameRect = studentNameElement.getBoundingClientRect();
                            const clickEvent = new MouseEvent('click', {
                                view: window,
                                bubbles: true,
                                cancelable: true,
                                clientX: nameRect.left + nameRect.width / 2,
                                clientY: nameRect.top + nameRect.height / 2,
                                button: 0,
                                buttons: 1
                            });
                            
                            studentNameElement.dispatchEvent(clickEvent);
                            studentNameElement.click();
                            
                            setTimeout(function() {
                                const finalCheck = document.querySelector('.studentList___1wvec.stuCheck___nZzmU');
                                if (finalCheck && finalCheck !== beforeSwitch) {
                                    showNotification('✅ 提交+点击学生姓名成功！', 'success');
                                } else {
                                    showNotification('❌ 提交功能多次尝试失败，请手动切换', 'error');
                                }
                            }, 1000);
                            
                        } else {
                            showNotification('❌ 未找到学生姓名元素，请手动切换', 'error');
                        }
                        
                    }, 1000);
                }
            }, 1000);
            
        }, 2000);
    }

    // 编辑按钮功能（只点击编辑按钮）
    function clickEditButton() {
        showNotification('正在查找编辑按钮...', 'info');
        
        const editButton = findEditButton();
        if (!editButton) {
            showNotification('未找到编辑按钮', 'error');
            return;
        }
        
        showNotification('找到编辑按钮，正在点击...', 'info');
        console.log('[编辑] 找到编辑按钮:', editButton);
        
        triggerClick(editButton);
        showNotification('✅ 编辑按钮点击完成！', 'success');
    }

    // 使面板可拖拽
    function makeDraggable(element) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        let dragStartTime = 0;

        // 鼠标按下
        element.addEventListener('mousedown', function(e) {
            // 如果点击的是按钮，不触发拖拽
            if (e.target.tagName === 'BUTTON') {
                return;
            }
            
            dragStartTime = Date.now();
            isDragging = true;
            
            const rect = element.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            element.style.cursor = 'grabbing';
            element.style.transition = 'none';
            
            e.preventDefault();
        });

        // 鼠标移动
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            
            // 限制在窗口范围内
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;
            
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            element.style.left = clampedX + 'px';
            element.style.top = clampedY + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        });

        // 鼠标释放
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'move';
                element.style.transition = 'all 0.2s ease';
                
                // 保存位置到localStorage
                const rect = element.getBoundingClientRect();
                const position = {
                    left: rect.left + 'px',
                    top: rect.top + 'px'
                };
                localStorage.setItem('actionPanelPosition', JSON.stringify(position));
            }
        });
    }

    // 获取保存的位置
    function getSavedPosition() {
        const saved = localStorage.getItem('actionPanelPosition');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // 初始化函数
    function init() {
        console.log('[批量操作] 开始初始化');
        console.log('[批量操作] 当前URL:', window.location.href);
        
        // 创建按钮面板
        const panel = createButtonPanel();
        
        // 应用保存的位置
        const savedPos = getSavedPosition();
        if (savedPos) {
            panel.style.left = savedPos.left;
            panel.style.top = savedPos.top;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }
        
        // 使面板可拖拽
        makeDraggable(panel);
        
        // 添加到页面
        document.body.appendChild(panel);
        console.log('[批量操作] 面板已添加');
        
        showNotification('批量操作面板已启动', 'info');
        
        // 检查面板是否成功添加
        setTimeout(function() {
            const checkPanel = document.getElementById('action-panel');
            if (checkPanel) {
                console.log('[批量操作] ✅ 面板确认存在');
            } else {
                console.log('[批量操作] ❌ 面板创建失败');
            }
        }, 1000);
    }

    // 启动脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[批量操作] 脚本加载完成');

})();