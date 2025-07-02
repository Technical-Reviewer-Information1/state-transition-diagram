// 状態遷移図描画エンジン

// 状態クラス
class State {
    constructor(x, y, type = 'normal', label = '') {
        this.id = StringUtils.generateId('state');
        this.x = x;
        this.y = y;
        this.type = type; // 'initial', 'normal', 'final'
        this.label = label;
        this.radius = 30;
        this.selected = false;
        this.hovered = false;
        this.editing = false;
        this.color = '#ffffff';
        this.borderColor = '#333333';
        this.textColor = '#333333';
    }

    // 状態を描画
    draw(ctx) {
        const { x, y, radius } = this;
        
        // 選択状態の背景
        if (this.selected) {
            ctx.save();
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(x, y, radius + 5, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }

        // ホバー状態の背景
        if (this.hovered && !this.selected) {
            ctx.save();
            ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
            ctx.beginPath();
            ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }

        // 状態の描画
        ctx.save();
        
        switch (this.type) {
            case 'initial':
                this.drawInitialState(ctx);
                break;
            case 'final':
                this.drawFinalState(ctx);
                break;
            default:
                this.drawNormalState(ctx);
                break;
        }

        // ラベルの描画
        if (this.label) {
            this.drawLabel(ctx);
        }

        ctx.restore();
    }

    // 通常状態の描画
    drawNormalState(ctx) {
        const { x, y, radius } = this;
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    // 初期状態の描画
    drawInitialState(ctx) {
        const { x, y, radius } = this;
        
        // 外側の円
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // 内側の黒い円
        ctx.fillStyle = this.borderColor;
        ctx.beginPath();
        ctx.arc(x, y, radius - 8, 0, 2 * Math.PI);
        ctx.fill();
    }

    // 終了状態の描画
    drawFinalState(ctx) {
        const { x, y, radius } = this;
        
        // 外側の円
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // 内側の円
        ctx.beginPath();
        ctx.arc(x, y, radius - 6, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // ラベルの描画
    drawLabel(ctx) {
        const { x, y } = this;
        
        ctx.fillStyle = this.textColor;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // テキストの背景（読みやすさのため）
        const metrics = ctx.measureText(this.label);
        const textWidth = metrics.width;
        const textHeight = 16;
        
        if (this.type !== 'initial') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(x - textWidth / 2 - 2, y - textHeight / 2 - 2, textWidth + 4, textHeight + 4);
        }
        
        ctx.fillStyle = this.textColor;
        ctx.fillText(this.label, x, y);
    }

    // 点が状態内にあるかチェック
    containsPoint(point) {
        return MathUtils.distance(point, { x: this.x, y: this.y }) <= this.radius;
    }

    // 状態の境界ボックスを取得
    getBounds() {
        const { x, y, radius } = this;
        return {
            x: x - radius,
            y: y - radius,
            width: radius * 2,
            height: radius * 2
        };
    }

    // 状態を移動
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    // 状態のデータを取得
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            type: this.type,
            label: this.label,
            radius: this.radius,
            color: this.color,
            borderColor: this.borderColor,
            textColor: this.textColor
        };
    }

    // データから状態を復元
    static fromJSON(data) {
        const state = new State(data.x, data.y, data.type, data.label);
        state.id = data.id;
        state.radius = data.radius || 30;
        state.color = data.color || '#ffffff';
        state.borderColor = data.borderColor || '#333333';
        state.textColor = data.textColor || '#333333';
        return state;
    }
}

// 遷移クラス
class Transition {
    constructor(fromState, toState, label = '') {
        this.id = StringUtils.generateId('transition');
        this.fromState = fromState;
        this.toState = toState;
        this.label = label;
        this.selected = false;
        this.hovered = false;
        this.color = '#333333';
        this.labelColor = '#333333';
        this.controlPoint = null; // ベジェ曲線用の制御点
        this.isSelfLoop = fromState === toState;
    }

    // 遷移を描画
    draw(ctx) {
        if (this.isSelfLoop) {
            this.drawSelfLoop(ctx);
        } else {
            this.drawTransition(ctx);
        }

        // ラベルの描画
        if (this.label) {
            this.drawLabel(ctx);
        }
    }

    // 通常の遷移を描画
    drawTransition(ctx) {
        const startPoint = this.getStartPoint();
        const endPoint = this.getEndPoint();
        
        ctx.save();
        
        // 選択状態の描画
        if (this.selected) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 4;
        } else if (this.hovered) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
        }

        // 矢印の描画
        if (this.controlPoint) {
            // ベジェ曲線
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.quadraticCurveTo(this.controlPoint.x, this.controlPoint.y, endPoint.x, endPoint.y);
            ctx.stroke();
        } else {
            // 直線
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        }

        // 矢印の頭部を描画
        this.drawArrowHead(ctx, startPoint, endPoint);
        
        ctx.restore();
    }

    // 自己ループを描画
    drawSelfLoop(ctx) {
        const { x, y, radius } = this.fromState;
        const loopRadius = 20;
        const centerX = x + radius + loopRadius;
        const centerY = y - radius - loopRadius;

        ctx.save();
        
        if (this.selected) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 4;
        } else if (this.hovered) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
        }

        // ループの円を描画
        ctx.beginPath();
        ctx.arc(centerX, centerY, loopRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // 矢印の頭部
        const arrowAngle = Math.PI / 6;
        const arrowLength = 10;
        const arrowX = centerX + loopRadius;
        const arrowY = centerY;
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowLength * Math.cos(arrowAngle), arrowY - arrowLength * Math.sin(arrowAngle));
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowLength * Math.cos(-arrowAngle), arrowY - arrowLength * Math.sin(-arrowAngle));
        ctx.stroke();

        ctx.restore();
    }

    // 矢印の頭部を描画
    drawArrowHead(ctx, startPoint, endPoint) {
        const angle = MathUtils.angle(startPoint, endPoint);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;

        ctx.save();
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.moveTo(endPoint.x, endPoint.y);
        ctx.lineTo(
            endPoint.x - arrowLength * Math.cos(angle - arrowAngle),
            endPoint.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(
            endPoint.x - arrowLength * Math.cos(angle + arrowAngle),
            endPoint.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    // 遷移の開始点を取得
    getStartPoint() {
        if (this.isSelfLoop) {
            return { x: this.fromState.x, y: this.fromState.y - this.fromState.radius };
        }

        const angle = MathUtils.angle(
            { x: this.fromState.x, y: this.fromState.y },
            { x: this.toState.x, y: this.toState.y }
        );
        
        return {
            x: this.fromState.x + this.fromState.radius * Math.cos(angle),
            y: this.fromState.y + this.fromState.radius * Math.sin(angle)
        };
    }

    // 遷移の終了点を取得
    getEndPoint() {
        if (this.isSelfLoop) {
            return { x: this.fromState.x + this.fromState.radius, y: this.fromState.y };
        }

        const angle = MathUtils.angle(
            { x: this.toState.x, y: this.toState.y },
            { x: this.fromState.x, y: this.fromState.y }
        );
        
        return {
            x: this.toState.x + this.toState.radius * Math.cos(angle),
            y: this.toState.y + this.toState.radius * Math.sin(angle)
        };
    }

    // ラベルの描画
    drawLabel(ctx) {
        let labelX, labelY;

        if (this.isSelfLoop) {
            const { x, y, radius } = this.fromState;
            labelX = x + radius + 20;
            labelY = y - radius - 40;
        } else {
            const startPoint = this.getStartPoint();
            const endPoint = this.getEndPoint();
            
            if (this.controlPoint) {
                labelX = this.controlPoint.x;
                labelY = this.controlPoint.y - 10;
            } else {
                labelX = (startPoint.x + endPoint.x) / 2;
                labelY = (startPoint.y + endPoint.y) / 2 - 10;
            }
        }

        ctx.save();
        ctx.fillStyle = this.labelColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // テキストの背景
        const metrics = ctx.measureText(this.label);
        const textWidth = metrics.width;
        const textHeight = 14;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(labelX - textWidth / 2 - 2, labelY - textHeight / 2 - 2, textWidth + 4, textHeight + 4);
        
        ctx.fillStyle = this.labelColor;
        ctx.fillText(this.label, labelX, labelY);
        
        ctx.restore();
    }

    // 点が遷移線上にあるかチェック
    containsPoint(point, tolerance = 5) {
        if (this.isSelfLoop) {
            const { x, y, radius } = this.fromState;
            const loopRadius = 20;
            const centerX = x + radius + loopRadius;
            const centerY = y - radius - loopRadius;
            const distance = Math.abs(MathUtils.distance(point, { x: centerX, y: centerY }) - loopRadius);
            return distance <= tolerance;
        } else {
            const startPoint = this.getStartPoint();
            const endPoint = this.getEndPoint();
            return MathUtils.distanceToLine(point, startPoint, endPoint) <= tolerance;
        }
    }

    // 遷移のデータを取得
    toJSON() {
        return {
            id: this.id,
            fromStateId: this.fromState.id,
            toStateId: this.toState.id,
            label: this.label,
            color: this.color,
            labelColor: this.labelColor,
            controlPoint: this.controlPoint
        };
    }

    // データから遷移を復元
    static fromJSON(data, states) {
        const fromState = states.find(s => s.id === data.fromStateId);
        const toState = states.find(s => s.id === data.toStateId);
        
        if (!fromState || !toState) {
            throw new Error('Invalid state reference in transition');
        }

        const transition = new Transition(fromState, toState, data.label);
        transition.id = data.id;
        transition.color = data.color || '#333333';
        transition.labelColor = data.labelColor || '#333333';
        transition.controlPoint = data.controlPoint;
        return transition;
    }
}

// 状態遷移図エンジン
class StateDiagramEngine {
    constructor(canvas, gridCanvas) {
        this.canvas = canvas;
        this.gridCanvas = gridCanvas;
        this.ctx = canvas.getContext('2d');
        this.gridCtx = gridCanvas.getContext('2d');
        
        this.states = [];
        this.transitions = [];
        this.selectedItems = [];
        this.hoveredItem = null;
        
        this.gridSize = 20;
        this.gridVisible = true;
        this.snapToGrid = true;
        
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.isDragging = false;
        this.dragStart = null;
        this.dragItem = null;
        
        this.isTransitionMode = false;
        this.transitionStart = null;
        
        this.onStateSelected = null;
        this.onTransitionSelected = null;
        this.onSelectionChanged = null;
        this.onDiagramChanged = null;
        
        this.initEventHandlers();
        this.drawGrid();
    }

    // イベントハンドラーの初期化
    initEventHandlers() {
        // マウスイベント
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // タッチイベント
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // コンテキストメニュー
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // ホイールイベント（ズーム）
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    }

    // マウスダウンイベント
    handleMouseDown(event) {
        event.preventDefault();
        const point = this.getCanvasPoint(event);
        const item = this.getItemAt(point);
        
        this.dragStart = point;
        
        if (this.isTransitionMode) {
            if (item && item instanceof State) {
                this.transitionStart = item;
            }
            return;
        }
        
        if (item) {
            if (!item.selected) {
                this.selectItem(item, !event.ctrlKey);
            }
            this.dragItem = item;
            this.isDragging = false;
        } else {
            this.clearSelection();
        }
    }

    // マウス移動イベント
    handleMouseMove(event) {
        const point = this.getCanvasPoint(event);
        
        if (this.dragStart && this.dragItem && MathUtils.distance(point, this.dragStart) > 5) {
            this.isDragging = true;
            
            if (this.dragItem instanceof State) {
                const dx = point.x - this.dragStart.x;
                const dy = point.y - this.dragStart.y;
                
                this.selectedItems.forEach(item => {
                    if (item instanceof State) {
                        let newX = item.x + dx;
                        let newY = item.y + dy;
                        
                        if (this.snapToGrid) {
                            newX = MathUtils.snapToGrid(newX, this.gridSize);
                            newY = MathUtils.snapToGrid(newY, this.gridSize);
                        }
                        
                        item.moveTo(newX, newY);
                    }
                });
                
                this.dragStart = point;
                this.render();
                this.notifyDiagramChanged();
            }
        } else {
            // ホバー処理
            const hoveredItem = this.getItemAt(point);
            if (hoveredItem !== this.hoveredItem) {
                if (this.hoveredItem) {
                    this.hoveredItem.hovered = false;
                }
                this.hoveredItem = hoveredItem;
                if (this.hoveredItem) {
                    this.hoveredItem.hovered = true;
                }
                this.render();
            }
        }
        
        // カーソルの変更
        if (this.hoveredItem) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    // マウスアップイベント
    handleMouseUp(event) {
        if (this.isTransitionMode && this.transitionStart) {
            const point = this.getCanvasPoint(event);
            const targetState = this.getItemAt(point);
            
            if (targetState && targetState instanceof State) {
                this.createTransition(this.transitionStart, targetState);
            }
            
            this.transitionStart = null;
        }
        
        this.isDragging = false;
        this.dragStart = null;
        this.dragItem = null;
    }

    // クリックイベント
    handleClick(event) {
        if (this.isDragging) return;
        
        const point = this.getCanvasPoint(event);
        const item = this.getItemAt(point);
        
        // 状態作成は app.js で処理するため、ここでは何もしない
        // 選択やクリアなどの処理のみ行う
        if (!item) {
            this.clearSelection();
        }
    }

    // ダブルクリックイベント
    handleDoubleClick(event) {
        const point = this.getCanvasPoint(event);
        const item = this.getItemAt(point);
        
        if (item) {
            this.editItem(item);
        }
    }

    // タッチイベント（モバイル対応）
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {},
            ctrlKey: false
        });
    }

    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }

    handleTouchEnd(event) {
        event.preventDefault();
        this.handleMouseUp({});
    }

    // コンテキストメニュー
    handleContextMenu(event) {
        event.preventDefault();
        const point = this.getCanvasPoint(event);
        const item = this.getItemAt(point);
        
        if (item) {
            this.showContextMenu(event, item);
        }
    }

    // ホイールイベント（ズーム）
    handleWheel(event) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(delta, { x: event.offsetX, y: event.offsetY });
    }

    // キャンバス座標を取得
    getCanvasPoint(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.scale - this.offsetX;
        const y = (event.clientY - rect.top) / this.scale - this.offsetY;
        return { x, y };
    }

    // 指定位置のアイテムを取得
    getItemAt(point) {
        // 状態を優先的にチェック
        for (const state of this.states) {
            if (state.containsPoint(point)) {
                return state;
            }
        }
        
        // 遷移をチェック
        for (const transition of this.transitions) {
            if (transition.containsPoint(point)) {
                return transition;
            }
        }
        
        return null;
    }

    // 状態を作成
    createState(x, y, type = 'normal', label = '') {
        if (this.snapToGrid) {
            x = MathUtils.snapToGrid(x, this.gridSize);
            y = MathUtils.snapToGrid(y, this.gridSize);
        }
        
        const state = new State(x, y, type, label);
        this.states.push(state);
        this.render();
        this.notifyDiagramChanged();
        return state;
    }

    // 指定位置に状態を作成
    createStateAt(point, type = 'normal') {
        return this.createState(point.x, point.y, type);
    }

    // 遷移を作成
    createTransition(fromState, toState, label = '') {
        // 既存の遷移をチェック
        const existing = this.transitions.find(t => 
            t.fromState === fromState && t.toState === toState
        );
        
        if (existing) {
            return existing;
        }
        
        const transition = new Transition(fromState, toState, label);
        this.transitions.push(transition);
        this.render();
        this.notifyDiagramChanged();
        return transition;
    }

    // アイテムを選択
    selectItem(item, clearOthers = true) {
        if (clearOthers) {
            this.clearSelection();
        }
        
        if (!item.selected) {
            item.selected = true;
            this.selectedItems.push(item);
        }
        
        this.render();
        this.notifySelectionChanged();
    }

    // 選択を解除
    clearSelection() {
        this.selectedItems.forEach(item => {
            item.selected = false;
        });
        this.selectedItems = [];
        this.render();
        this.notifySelectionChanged();
    }

    // アイテムを削除
    deleteItem(item) {
        if (item instanceof State) {
            this.deleteState(item);
        } else if (item instanceof Transition) {
            this.deleteTransition(item);
        }
    }

    // 状態を削除
    deleteState(state) {
        // 関連する遷移を削除
        this.transitions = this.transitions.filter(t => 
            t.fromState !== state && t.toState !== state
        );
        
        // 状態を削除
        ArrayUtils.remove(this.states, state);
        ArrayUtils.remove(this.selectedItems, state);
        
        this.render();
        this.notifyDiagramChanged();
    }

    // 遷移を削除
    deleteTransition(transition) {
        ArrayUtils.remove(this.transitions, transition);
        ArrayUtils.remove(this.selectedItems, transition);
        
        this.render();
        this.notifyDiagramChanged();
    }

    // 選択されたアイテムを削除
    deleteSelected() {
        const toDelete = [...this.selectedItems];
        toDelete.forEach(item => this.deleteItem(item));
    }

    // アイテムを編集
    editItem(item) {
        if (item instanceof State) {
            this.editState(item);
        } else if (item instanceof Transition) {
            this.editTransition(item);
        }
    }

    // 状態を編集
    editState(state) {
        const newLabel = prompt('状態名を入力してください:', state.label);
        if (newLabel !== null) {
            state.label = newLabel;
            this.render();
            this.notifyDiagramChanged();
        }
    }

    // 遷移を編集
    editTransition(transition) {
        const newLabel = prompt('遷移条件を入力してください:', transition.label);
        if (newLabel !== null) {
            transition.label = newLabel;
            this.render();
            this.notifyDiagramChanged();
        }
    }

    // ズーム
    zoom(factor, center) {
        const newScale = Math.max(0.1, Math.min(5, this.scale * factor));
        
        if (center) {
            const deltaScale = newScale - this.scale;
            this.offsetX -= (center.x * deltaScale) / newScale;
            this.offsetY -= (center.y * deltaScale) / newScale;
        }
        
        this.scale = newScale;
        this.render();
    }

    // パン（移動）
    pan(dx, dy) {
        this.offsetX += dx / this.scale;
        this.offsetY += dy / this.scale;
        this.render();
    }

    // フィット表示
    fitToView() {
        if (this.states.length === 0) return;
        
        const bounds = this.getDiagramBounds();
        const padding = 50;
        
        const scaleX = (this.canvas.width - padding * 2) / bounds.width;
        const scaleY = (this.canvas.height - padding * 2) / bounds.height;
        
        this.scale = Math.min(scaleX, scaleY, 1);
        this.offsetX = -bounds.x + padding / this.scale;
        this.offsetY = -bounds.y + padding / this.scale;
        
        this.render();
    }

    // 図形の境界を取得
    getDiagramBounds() {
        if (this.states.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        this.states.forEach(state => {
            const bounds = state.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    // グリッドを描画
    drawGrid() {
        if (!this.gridVisible) return;
        
        const ctx = this.gridCtx;
        const { width, height } = this.gridCanvas;
        
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        
        ctx.scale(this.scale, this.scale);
        ctx.translate(this.offsetX, this.offsetY);
        
        const startX = Math.floor(-this.offsetX / this.gridSize) * this.gridSize;
        const startY = Math.floor(-this.offsetY / this.gridSize) * this.gridSize;
        const endX = startX + width / this.scale + this.gridSize;
        const endY = startY + height / this.scale + this.gridSize;
        
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color') || '#e0e0e0';
        ctx.lineWidth = 1 / this.scale;
        
        // 縦線
        for (let x = startX; x < endX; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        
        // 横線
        for (let y = startY; y < endY; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // 描画
    render() {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, width, height);
        
        // 変換を適用
        ctx.save();
        ctx.scale(this.scale, this.scale);
        ctx.translate(this.offsetX, this.offsetY);
        
        // 遷移を描画
        this.transitions.forEach(transition => {
            transition.draw(ctx);
        });
        
        // 状態を描画
        this.states.forEach(state => {
            state.draw(ctx);
        });
        
        // 遷移作成中の線を描画
        if (this.isTransitionMode && this.transitionStart && this.dragStart) {
            ctx.save();
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            const startPoint = {
                x: this.transitionStart.x,
                y: this.transitionStart.y
            };
            
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(this.dragStart.x, this.dragStart.y);
            ctx.stroke();
            
            ctx.restore();
        }
        
        ctx.restore();
        
        // グリッドを再描画
        this.drawGrid();
    }

    // データをJSONで取得
    toJSON() {
        return {
            states: this.states.map(state => state.toJSON()),
            transitions: this.transitions.map(transition => transition.toJSON()),
            settings: {
                gridSize: this.gridSize,
                gridVisible: this.gridVisible,
                snapToGrid: this.snapToGrid
            }
        };
    }

    // JSONからデータを読み込み
    fromJSON(data) {
        this.clear();
        
        // 状態を復元
        this.states = data.states.map(stateData => State.fromJSON(stateData));
        
        // 遷移を復元
        this.transitions = data.transitions.map(transitionData => 
            Transition.fromJSON(transitionData, this.states)
        );
        
        // 設定を復元
        if (data.settings) {
            this.gridSize = data.settings.gridSize || 20;
            this.gridVisible = data.settings.gridVisible !== false;
            this.snapToGrid = data.settings.snapToGrid !== false;
        }
        
        this.render();
        this.notifyDiagramChanged();
    }

    // 図形をクリア
    clear() {
        this.states = [];
        this.transitions = [];
        this.selectedItems = [];
        this.hoveredItem = null;
        this.render();
        this.notifyDiagramChanged();
    }

    // 遷移モードの切り替え
    setTransitionMode(enabled) {
        this.isTransitionMode = enabled;
        this.transitionStart = null;
        this.canvas.style.cursor = enabled ? 'crosshair' : 'default';
    }

    // グリッド設定
    setGridVisible(visible) {
        this.gridVisible = visible;
        this.drawGrid();
    }

    setSnapToGrid(enabled) {
        this.snapToGrid = enabled;
    }

    setGridSize(size) {
        this.gridSize = size;
        this.drawGrid();
    }

    // コンテキストメニューを表示
    showContextMenu(event, item) {
        // 実装は app.js で行う
        if (this.onContextMenu) {
            this.onContextMenu(event, item);
        }
    }

    // イベント通知
    notifySelectionChanged() {
        if (this.onSelectionChanged) {
            this.onSelectionChanged(this.selectedItems);
        }
    }

    notifyDiagramChanged() {
        if (this.onDiagramChanged) {
            this.onDiagramChanged();
        }
    }

    // 統計情報を取得
    getStatistics() {
        return {
            stateCount: this.states.length,
            transitionCount: this.transitions.length,
            initialStates: this.states.filter(s => s.type === 'initial').length,
            finalStates: this.states.filter(s => s.type === 'final').length,
            normalStates: this.states.filter(s => s.type === 'normal').length
        };
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.State = State;
    window.Transition = Transition;
    window.StateDiagramEngine = StateDiagramEngine;
}