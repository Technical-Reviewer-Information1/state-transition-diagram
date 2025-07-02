// メインアプリケーションロジック

class StateDiagramApp {
    constructor() {
        this.engine = null;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        this.currentTool = 'select';
        this.currentStateType = 'normal';
        
        this.isDirty = false;
        this.lastSavedState = null;
        
        this.init();
    }

    // アプリケーションの初期化
    init() {
        this.initDOM();
        this.initEngine();
        this.initManagers();
        this.initEventHandlers();
        this.initKeyboardShortcuts();
        this.updateUI();
        this.checkURLParams();
        
        // 初期状態を履歴に追加
        this.saveToHistory('初期状態');
        
        console.log('状態遷移図エディタが初期化されました');
    }

    // DOM要素の初期化
    initDOM() {
        this.elements = {
            // キャンバス
            mainCanvas: DOMUtils.get('#main-canvas'),
            gridCanvas: DOMUtils.get('#grid-canvas'),
            canvasContainer: DOMUtils.get('.canvas-container'),
            canvasWrapper: DOMUtils.get('.canvas-wrapper'),
            
            // ツールボタン
            selectBtn: DOMUtils.get('#select-btn'),
            transitionBtn: DOMUtils.get('#transition-btn'),
            deleteBtn: DOMUtils.get('#delete-btn'),
            initialStateBtn: DOMUtils.get('#initial-state-btn'),
            normalStateBtn: DOMUtils.get('#normal-state-btn'),
            finalStateBtn: DOMUtils.get('#final-state-btn'),
            
            // ヘッダーボタン
            saveBtn: DOMUtils.get('#save-btn'),
            loadBtn: DOMUtils.get('#load-btn'),
            exportBtn: DOMUtils.get('#export-btn'),
            validateBtn: DOMUtils.get('#validate-btn'),
            
            // 表示制御
            gridToggle: DOMUtils.get('#grid-toggle'),
            snapToggle: DOMUtils.get('#snap-toggle'),
            zoomInBtn: DOMUtils.get('#zoom-in-btn'),
            zoomOutBtn: DOMUtils.get('#zoom-out-btn'),
            fitBtn: DOMUtils.get('#fit-btn'),
            zoomLevel: DOMUtils.get('#zoom-level'),
            
            // 履歴
            undoBtn: DOMUtils.get('#undo-btn'),
            redoBtn: DOMUtils.get('#redo-btn'),
            historyList: DOMUtils.get('#history-list'),
            
            // テンプレート
            templateSelect: DOMUtils.get('#template-select'),
            applyTemplateBtn: DOMUtils.get('#apply-template-btn'),
            
            // その他
            clearBtn: DOMUtils.get('#clear-btn'),
            canvasInfo: DOMUtils.get('#canvas-info'),
            toolStatus: DOMUtils.get('#tool-status'),
            coordStatus: DOMUtils.get('#coord-status'),
            appStatus: DOMUtils.get('#app-status'),
            fileInput: DOMUtils.get('#file-input'),
            
            // モーダル
            modalOverlay: DOMUtils.get('#modal-overlay'),
            modalTitle: DOMUtils.get('#modal-title'),
            modalBody: DOMUtils.get('#modal-body'),
            modalClose: DOMUtils.get('#modal-close'),
            modalCancel: DOMUtils.get('#modal-cancel'),
            modalConfirm: DOMUtils.get('#modal-confirm'),
            
            // プロパティパネル
            propertiesPanel: DOMUtils.get('#properties-panel'),
            propertiesContent: DOMUtils.get('#properties-content')
        };
        
        // キャンバスサイズを調整
        this.resizeCanvas();
        
        // リサイズイベントを監視
        window.addEventListener('resize', TimingUtils.debounce(() => {
            this.resizeCanvas();
        }, 250));
    }

    // エンジンの初期化
    initEngine() {
        this.engine = new StateDiagramEngine(
            this.elements.mainCanvas,
            this.elements.gridCanvas
        );
        
        // エンジンイベントハンドラーを設定
        this.engine.onSelectionChanged = (selectedItems) => {
            this.updatePropertiesPanel(selectedItems);
            this.updateToolStatus();
        };
        
        this.engine.onDiagramChanged = () => {
            this.isDirty = true;
            this.updateCanvasInfo();
            this.updateAppStatus();
        };
        
        this.engine.onContextMenu = (event, item) => {
            this.showContextMenu(event, item);
        };
    }

    // マネージャーの初期化
    initManagers() {
        // テンプレートマネージャーを初期化
        this.templateManager = new TemplateManager();
        this.templateManager.loadCustomTemplates();
        
        // バリデーションエンジンを初期化
        this.validationEngine = new ValidationEngine(this.engine);
        
        // エクスポートエンジンを初期化
        this.exportEngine = new ExportEngine(this.engine);
        
        // 状態遷移表ジェネレーターを初期化
        this.tableGenerator = new StateTableGenerator(this.engine);
    }

    // イベントハンドラーの初期化
    initEventHandlers() {
        // ツールボタン
        DOMUtils.on(this.elements.selectBtn, 'click', () => this.setTool('select'));
        DOMUtils.on(this.elements.transitionBtn, 'click', () => this.setTool('transition'));
        DOMUtils.on(this.elements.deleteBtn, 'click', () => this.setTool('delete'));
        
        // 状態作成ボタン
        DOMUtils.on(this.elements.initialStateBtn, 'click', () => this.setStateType('initial'));
        DOMUtils.on(this.elements.normalStateBtn, 'click', () => this.setStateType('normal'));
        DOMUtils.on(this.elements.finalStateBtn, 'click', () => this.setStateType('final'));
        
        // ヘッダーボタン
        DOMUtils.on(this.elements.saveBtn, 'click', () => this.saveFile());
        DOMUtils.on(this.elements.loadBtn, 'click', () => this.loadFile());
        DOMUtils.on(this.elements.exportBtn, 'click', () => this.showExportDialog());
        DOMUtils.on(this.elements.validateBtn, 'click', () => this.validateDiagram());
        
        // 表示制御
        DOMUtils.on(this.elements.gridToggle, 'change', (e) => {
            this.engine.setGridVisible(e.target.checked);
        });
        DOMUtils.on(this.elements.snapToggle, 'change', (e) => {
            this.engine.setSnapToGrid(e.target.checked);
        });
        DOMUtils.on(this.elements.zoomInBtn, 'click', () => this.zoomIn());
        DOMUtils.on(this.elements.zoomOutBtn, 'click', () => this.zoomOut());
        DOMUtils.on(this.elements.fitBtn, 'click', () => this.fitToView());
        
        // 履歴
        DOMUtils.on(this.elements.undoBtn, 'click', () => this.undo());
        DOMUtils.on(this.elements.redoBtn, 'click', () => this.redo());
        
        // テンプレート
        DOMUtils.on(this.elements.applyTemplateBtn, 'click', () => this.applyTemplate());
        
        // その他
        DOMUtils.on(this.elements.clearBtn, 'click', () => this.clearDiagram());
        DOMUtils.on(this.elements.fileInput, 'change', (e) => this.handleFileLoad(e));
        
        // モーダル
        DOMUtils.on(this.elements.modalClose, 'click', () => this.hideModal());
        DOMUtils.on(this.elements.modalCancel, 'click', () => this.hideModal());
        DOMUtils.on(this.elements.modalOverlay, 'click', (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.hideModal();
            }
        });
        
        // キャンバスでのマウス座標表示
        DOMUtils.on(this.elements.mainCanvas, 'mousemove', (e) => {
            const point = this.engine.getCanvasPoint(e);
            this.elements.coordStatus.textContent = `座標: (${Math.round(point.x)}, ${Math.round(point.y)})`;
        });
        
        // キャンバスクリック（状態作成）
        DOMUtils.on(this.elements.mainCanvas, 'click', (e) => {
            if (this.currentTool !== 'select' && this.currentTool !== 'transition' && this.currentTool !== 'delete') {
                const point = this.engine.getCanvasPoint(e);
                const item = this.engine.getItemAt(point);
                
                if (!item) {
                    this.engine.createStateAt(point, this.currentStateType);
                    this.saveToHistory(`${this.getStateTypeName(this.currentStateType)}を作成`);
                }
            }
        });
        
        // 削除ツールでのクリック
        DOMUtils.on(this.elements.mainCanvas, 'click', (e) => {
            if (this.currentTool === 'delete') {
                const point = this.engine.getCanvasPoint(e);
                const item = this.engine.getItemAt(point);
                
                if (item) {
                    this.engine.deleteItem(item);
                    this.saveToHistory(`${item instanceof State ? '状態' : '遷移'}を削除`);
                }
            }
        });
    }

    // キーボードショートカットの初期化
    initKeyboardShortcuts() {
        DOMUtils.on(document, 'keydown', (e) => {
            // モーダルが開いている場合はスキップ
            if (this.elements.modalOverlay.classList.contains('show')) {
                if (e.key === 'Escape') {
                    this.hideModal();
                }
                return;
            }
            
            // ショートカットキーの処理
            if (KeyboardUtils.isKeyCombo(e, 'ctrl+s')) {
                e.preventDefault();
                this.saveFile();
            } else if (KeyboardUtils.isKeyCombo(e, 'ctrl+o')) {
                e.preventDefault();
                this.loadFile();
            } else if (KeyboardUtils.isKeyCombo(e, 'ctrl+z')) {
                e.preventDefault();
                this.undo();
            } else if (KeyboardUtils.isKeyCombo(e, 'ctrl+y')) {
                e.preventDefault();
                this.redo();
            } else if (KeyboardUtils.isKeyCombo(e, 'delete')) {
                e.preventDefault();
                this.deleteSelected();
            } else if (KeyboardUtils.isKeyCombo(e, 'ctrl+a')) {
                e.preventDefault();
                this.selectAll();
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.setTool('transition');
            } else if (e.key === 'v' || e.key === 'V') {
                e.preventDefault();
                this.validateDiagram();
            } else if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                this.fitToView();
            } else if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                this.elements.gridToggle.checked = !this.elements.gridToggle.checked;
                this.engine.setGridVisible(this.elements.gridToggle.checked);
            } else if (KeyboardUtils.isKeyCombo(e, 'ctrl++')) {
                e.preventDefault();
                this.zoomIn();
            } else if (KeyboardUtils.isKeyCombo(e, 'ctrl+-')) {
                e.preventDefault();
                this.zoomOut();
            } else if (KeyboardUtils.isKeyCombo(e, 'ctrl+0')) {
                e.preventDefault();
                this.resetZoom();
            }
        });
    }

    // キャンバスサイズの調整
    resizeCanvas() {
        const container = this.elements.canvasWrapper;
        const rect = container.getBoundingClientRect();
        
        const width = rect.width;
        const height = rect.height;
        
        // メインキャンバス
        this.elements.mainCanvas.width = width;
        this.elements.mainCanvas.height = height;
        
        // グリッドキャンバス
        this.elements.gridCanvas.width = width;
        this.elements.gridCanvas.height = height;
        
        // 再描画
        if (this.engine) {
            this.engine.render();
        }
    }

    // ツールの設定
    setTool(tool) {
        this.currentTool = tool;
        
        // ツールボタンの更新
        const toolButtons = DOMUtils.getAll('.tool-btn[data-tool]');
        toolButtons.forEach(btn => {
            DOMUtils.removeClass(btn, 'active');
            if (btn.dataset.tool === tool) {
                DOMUtils.addClass(btn, 'active');
            }
        });
        
        // エンジンの遷移モードを設定
        this.engine.setTransitionMode(tool === 'transition');
        
        this.updateToolStatus();
    }

    // 状態タイプの設定
    setStateType(type) {
        this.currentStateType = type;
        this.setTool(type);
        
        // 状態ボタンの更新
        const stateButtons = DOMUtils.getAll('.tool-btn[data-tool$="-state"]');
        stateButtons.forEach(btn => {
            DOMUtils.removeClass(btn, 'active');
        });
        DOMUtils.addClass(DOMUtils.get(`#${type}-state-btn`), 'active');
        
        this.updateToolStatus();
    }

    // 状態タイプ名を取得
    getStateTypeName(type) {
        const names = {
            'initial': '初期状態',
            'normal': '通常状態',
            'final': '終了状態'
        };
        return names[type] || '状態';
    }

    // ズームイン
    zoomIn() {
        this.engine.zoom(1.2);
        this.updateZoomLevel();
    }

    // ズームアウト
    zoomOut() {
        this.engine.zoom(0.8);
        this.updateZoomLevel();
    }

    // ズームリセット
    resetZoom() {
        this.engine.scale = 1;
        this.engine.offsetX = 0;
        this.engine.offsetY = 0;
        this.engine.render();
        this.updateZoomLevel();
    }

    // フィット表示
    fitToView() {
        this.engine.fitToView();
        this.updateZoomLevel();
    }

    // ズームレベルの更新
    updateZoomLevel() {
        const percentage = Math.round(this.engine.scale * 100);
        this.elements.zoomLevel.textContent = `${percentage}%`;
    }

    // 選択されたアイテムを削除
    deleteSelected() {
        if (this.engine.selectedItems.length > 0) {
            this.engine.deleteSelected();
            this.saveToHistory('選択項目を削除');
        }
    }

    // 全選択
    selectAll() {
        this.engine.states.forEach(state => {
            this.engine.selectItem(state, false);
        });
        this.engine.transitions.forEach(transition => {
            this.engine.selectItem(transition, false);
        });
    }

    // 図形をクリア
    clearDiagram() {
        if (confirm('すべての図形を削除しますか？')) {
            this.engine.clear();
            this.saveToHistory('図形をクリア');
        }
    }

    // ファイル保存
    saveFile() {
        const data = this.engine.toJSON();
        data.metadata = {
            title: '状態遷移図',
            createdAt: new Date().toISOString(),
            version: '1.0'
        };
        
        FileUtils.downloadJSON(data, 'state-diagram.json');
        this.lastSavedState = ObjectUtils.deepClone(data);
        this.isDirty = false;
        this.updateAppStatus();
    }

    // ファイル読み込み
    loadFile() {
        if (this.isDirty && !confirm('未保存の変更があります。続行しますか？')) {
            return;
        }
        
        this.elements.fileInput.click();
    }

    // ファイル読み込み処理
    async handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const content = await FileUtils.readFile(file);
            const data = JSON.parse(content);
            
            this.engine.fromJSON(data);
            this.saveToHistory('ファイルを読み込み');
            this.isDirty = false;
            this.updateAppStatus();
            
        } catch (error) {
            alert('ファイルの読み込みに失敗しました: ' + error.message);
        }
        
        // ファイル入力をリセット
        event.target.value = '';
    }

    // エクスポートダイアログを表示
    showExportDialog() {
        const dialogHTML = this.exportEngine.generateExportDialog();
        this.showModal('エクスポート', dialogHTML, () => {
            this.executeExport();
        });
        
        // タブ切り替えの設定
        this.setupExportTabs();
        
        // 共有URLを生成
        setTimeout(() => {
            const shareUrl = this.exportEngine.generateShareableURL();
            const urlTextarea = document.querySelector('#share-url');
            if (urlTextarea) {
                urlTextarea.value = shareUrl;
            }
        }, 100);
    }

    // 図形の検証
    validateDiagram() {
        const result = this.validationEngine.validate();
        const reportHTML = this.validationEngine.generateHTMLReport();
        
        this.showModal('検証結果', reportHTML);
    }

    // テンプレートを適用
    applyTemplate() {
        const templateName = this.elements.templateSelect.value;
        if (!templateName) return;
        
        if (this.isDirty && !confirm('現在の図形が失われます。続行しますか？')) {
            return;
        }
        
        const template = this.templateManager.getTemplate(templateName);
        if (template) {
            this.engine.fromJSON(template.data);
            this.saveToHistory(`テンプレート「${template.name}」を適用`);
            this.isDirty = false;
            this.updateAppStatus();
        }
    }

    // 履歴に保存
    saveToHistory(description) {
        const state = {
            data: ObjectUtils.deepClone(this.engine.toJSON()),
            description: description,
            timestamp: Date.now()
        };
        
        // 現在位置以降の履歴を削除
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 新しい状態を追加
        this.history.push(state);
        this.historyIndex = this.history.length - 1;
        
        // 履歴サイズを制限
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
            this.historyIndex = this.history.length - 1;
        }
        
        this.updateHistoryUI();
    }

    // アンドゥ
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.engine.fromJSON(state.data);
            this.updateHistoryUI();
        }
    }

    // リドゥ
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.engine.fromJSON(state.data);
            this.updateHistoryUI();
        }
    }

    // 履歴UIの更新
    updateHistoryUI() {
        // アンドゥ・リドゥボタンの状態更新
        this.elements.undoBtn.disabled = this.historyIndex <= 0;
        this.elements.redoBtn.disabled = this.historyIndex >= this.history.length - 1;
        
        // 履歴リストの更新
        this.elements.historyList.innerHTML = '';
        this.history.forEach((state, index) => {
            const item = DOMUtils.create('div', {
                class: `history-item ${index === this.historyIndex ? 'current' : ''}`
            }, state.description);
            
            DOMUtils.on(item, 'click', () => {
                this.historyIndex = index;
                this.engine.fromJSON(state.data);
                this.updateHistoryUI();
            });
            
            this.elements.historyList.appendChild(item);
        });
    }

    // プロパティパネルの更新
    updatePropertiesPanel(selectedItems) {
        const content = this.elements.propertiesContent;
        
        if (selectedItems.length === 0) {
            content.innerHTML = '<p>項目を選択してください</p>';
            return;
        }
        
        if (selectedItems.length === 1) {
            const item = selectedItems[0];
            if (item instanceof State) {
                this.showStateProperties(item);
            } else if (item instanceof Transition) {
                this.showTransitionProperties(item);
            }
        } else {
            content.innerHTML = `<p>${selectedItems.length}個の項目が選択されています</p>`;
        }
    }

    // 状態のプロパティを表示
    showStateProperties(state) {
        const content = this.elements.propertiesContent;
        
        content.innerHTML = `
            <div class="form-group">
                <label>状態名</label>
                <input type="text" id="state-label" value="${state.label}" placeholder="状態名を入力">
            </div>
            <div class="form-group">
                <label>タイプ</label>
                <select id="state-type">
                    <option value="normal" ${state.type === 'normal' ? 'selected' : ''}>通常状態</option>
                    <option value="initial" ${state.type === 'initial' ? 'selected' : ''}>初期状態</option>
                    <option value="final" ${state.type === 'final' ? 'selected' : ''}>終了状態</option>
                </select>
            </div>
            <div class="form-group">
                <label>位置</label>
                <div style="display: flex; gap: 8px;">
                    <input type="number" id="state-x" value="${Math.round(state.x)}" placeholder="X">
                    <input type="number" id="state-y" value="${Math.round(state.y)}" placeholder="Y">
                </div>
            </div>
        `;
        
        // イベントハンドラーを追加
        const labelInput = content.querySelector('#state-label');
        const typeSelect = content.querySelector('#state-type');
        const xInput = content.querySelector('#state-x');
        const yInput = content.querySelector('#state-y');
        
        DOMUtils.on(labelInput, 'input', TimingUtils.debounce(() => {
            state.label = labelInput.value;
            this.engine.render();
            this.engine.notifyDiagramChanged();
        }, 300));
        
        DOMUtils.on(typeSelect, 'change', () => {
            state.type = typeSelect.value;
            this.engine.render();
            this.engine.notifyDiagramChanged();
        });
        
        DOMUtils.on(xInput, 'input', TimingUtils.debounce(() => {
            state.x = parseInt(xInput.value) || 0;
            this.engine.render();
            this.engine.notifyDiagramChanged();
        }, 300));
        
        DOMUtils.on(yInput, 'input', TimingUtils.debounce(() => {
            state.y = parseInt(yInput.value) || 0;
            this.engine.render();
            this.engine.notifyDiagramChanged();
        }, 300));
    }

    // 遷移のプロパティを表示
    showTransitionProperties(transition) {
        const content = this.elements.propertiesContent;
        
        content.innerHTML = `
            <div class="form-group">
                <label>遷移条件</label>
                <input type="text" id="transition-label" value="${transition.label}" placeholder="遷移条件を入力">
            </div>
            <div class="form-group">
                <label>開始状態</label>
                <p>${transition.fromState.label || '無名'}</p>
            </div>
            <div class="form-group">
                <label>終了状態</label>
                <p>${transition.toState.label || '無名'}</p>
            </div>
        `;
        
        // イベントハンドラーを追加
        const labelInput = content.querySelector('#transition-label');
        
        DOMUtils.on(labelInput, 'input', TimingUtils.debounce(() => {
            transition.label = labelInput.value;
            this.engine.render();
            this.engine.notifyDiagramChanged();
        }, 300));
    }

    // キャンバス情報の更新
    updateCanvasInfo() {
        const stats = this.engine.getStatistics();
        this.elements.canvasInfo.textContent = 
            `状態: ${stats.stateCount}, 遷移: ${stats.transitionCount}`;
    }

    // ツールステータスの更新
    updateToolStatus() {
        const toolNames = {
            'select': '選択ツール',
            'transition': '遷移ツール',
            'delete': '削除ツール',
            'initial': '初期状態作成',
            'normal': '通常状態作成',
            'final': '終了状態作成'
        };
        
        this.elements.toolStatus.textContent = toolNames[this.currentTool] || 'ツール';
    }

    // アプリステータスの更新
    updateAppStatus() {
        if (this.isDirty) {
            this.elements.appStatus.textContent = '編集中 (未保存)';
        } else {
            this.elements.appStatus.textContent = '保存済み';
        }
    }

    // UIの更新
    updateUI() {
        this.updateCanvasInfo();
        this.updateToolStatus();
        this.updateAppStatus();
        this.updateZoomLevel();
        this.updateHistoryUI();
    }

    // コンテキストメニューを表示
    showContextMenu(event, item) {
        // 簡易的なコンテキストメニュー
        const menu = DOMUtils.create('div', {
            class: 'context-menu',
            style: `position: fixed; top: ${event.clientY}px; left: ${event.clientX}px; z-index: 1000; background: white; border: 1px solid #ccc; border-radius: 4px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);`
        });
        
        const editBtn = DOMUtils.create('button', {class: 'context-menu-item', style: 'display: block; width: 100%; padding: 4px 8px; border: none; background: none; text-align: left; cursor: pointer;'}, '編集');
        const deleteBtn = DOMUtils.create('button', {class: 'context-menu-item', style: 'display: block; width: 100%; padding: 4px 8px; border: none; background: none; text-align: left; cursor: pointer;'}, '削除');
        
        DOMUtils.on(editBtn, 'click', () => {
            this.engine.editItem(item);
            document.body.removeChild(menu);
        });
        
        DOMUtils.on(deleteBtn, 'click', () => {
            this.engine.deleteItem(item);
            this.saveToHistory(`${item instanceof State ? '状態' : '遷移'}を削除`);
            document.body.removeChild(menu);
        });
        
        menu.appendChild(editBtn);
        menu.appendChild(deleteBtn);
        document.body.appendChild(menu);
        
        // 外部クリックで閉じる
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    document.body.removeChild(menu);
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 10);
    }

    // モーダルを表示
    showModal(title, content, onConfirm = null) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalBody.innerHTML = content;
        
        this.elements.modalConfirm.onclick = () => {
            if (onConfirm) {
                onConfirm();
            }
            this.hideModal();
        };
        
        this.elements.modalOverlay.classList.add('show');
    }

    // モーダルを非表示
    hideModal() {
        this.elements.modalOverlay.classList.remove('show');
    }

    // URL パラメータをチェック
    checkURLParams() {
        const params = URLUtils.paramsToObject();
        if (params.data) {
            try {
                const jsonData = URLUtils.decodeBase64(params.data);
                const data = JSON.parse(jsonData);
                this.engine.fromJSON(data);
                this.saveToHistory('共有URLから読み込み');
                this.isDirty = false;
                this.updateAppStatus();
            } catch (error) {
                console.error('Failed to load data from URL:', error);
                alert('URLからのデータ読み込みに失敗しました');
            }
        }
    }

    // エクスポート実行
    executeExport() {
        const imageFormat = document.querySelector('#image-format')?.value;
        const vectorFormat = document.querySelector('#vector-format')?.value;
        const dataFormat = document.querySelector('#data-format')?.value;
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;

        switch (activeTab) {
            case 'image':
                this.executeImageExport(imageFormat);
                break;
            case 'vector':
                this.executeVectorExport(vectorFormat);
                break;
            case 'data':
                this.executeDataExport(dataFormat);
                break;
            case 'share':
                this.executeShareExport();
                break;
        }
    }

    // 画像エクスポート実行
    executeImageExport(format) {
        const scale = parseFloat(document.querySelector('#image-scale')?.value || '2');
        const bgColor = document.querySelector('#bg-color')?.value || '#ffffff';
        const padding = parseInt(document.querySelector('#padding')?.value || '50');

        const options = {
            scale,
            backgroundColor: bgColor,
            padding
        };

        if (format === 'jpeg') {
            this.exportEngine.exportToJPEG(options);
        } else {
            this.exportEngine.exportToPNG(options);
        }
    }

    // ベクターエクスポート実行
    executeVectorExport(format) {
        const padding = parseInt(document.querySelector('#vector-padding')?.value || '50');
        const options = { padding };

        if (format === 'svg') {
            this.exportEngine.exportToSVG(options);
        } else if (format === 'pdf') {
            this.exportEngine.exportToPDF(options);
        }
    }

    // データエクスポート実行
    executeDataExport(format) {
        switch (format) {
            case 'json':
                this.saveFile();
                break;
            case 'table-html':
                const htmlTable = this.tableGenerator.generateTable();
                this.exportEngine.exportTableAsHTML(htmlTable);
                break;
            case 'table-csv':
                const csvTable = this.tableGenerator.generateTable();
                this.exportEngine.exportTableAsCSV(csvTable);
                break;
            case 'table-json':
                const jsonTable = this.tableGenerator.generateTable();
                this.exportEngine.exportTableAsJSON(jsonTable);
                break;
        }
    }

    // 共有エクスポート実行
    executeShareExport() {
        const urlTextarea = document.querySelector('#share-url');
        if (urlTextarea) {
            urlTextarea.select();
            document.execCommand('copy');
            alert('共有URLをクリップボードにコピーしました');
        }
    }

    // エクスポートタブの設定
    setupExportTabs() {
        setTimeout(() => {
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabPanels = document.querySelectorAll('.tab-panel');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetTab = btn.dataset.tab;
                    
                    // すべてのタブを非アクティブに
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabPanels.forEach(p => p.classList.remove('active'));
                    
                    // 選択されたタブをアクティブに
                    btn.classList.add('active');
                    document.getElementById(`${targetTab}-panel`).classList.add('active');
                });
            });

            // URLコピーボタンの設定
            const copyBtn = document.querySelector('#copy-url-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const urlTextarea = document.querySelector('#share-url');
                    if (urlTextarea) {
                        urlTextarea.select();
                        document.execCommand('copy');
                        alert('URLをクリップボードにコピーしました');
                    }
                });
            }
        }, 100);
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StateDiagramApp();
});