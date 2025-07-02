// 状態遷移図検証エンジン

class ValidationEngine {
    constructor(engine) {
        this.engine = engine;
        this.errors = [];
        this.warnings = [];
    }

    // 完全な検証を実行
    validate() {
        this.errors = [];
        this.warnings = [];

        this.validateBasicStructure();
        this.validateReachability();
        this.validateCompleteness();
        this.validateNaming();
        this.validateLoops();

        return {
            isValid: this.errors.length === 0,
            errors: [...this.errors],
            warnings: [...this.warnings],
            summary: this.generateSummary()
        };
    }

    // 基本構造の検証
    validateBasicStructure() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;

        // 状態数チェック
        if (states.length === 0) {
            this.errors.push({
                type: 'structure',
                message: '状態が一つも存在しません',
                severity: 'error'
            });
            return;
        }

        // 初期状態のチェック
        const initialStates = states.filter(s => s.type === 'initial');
        if (initialStates.length === 0) {
            this.errors.push({
                type: 'structure',
                message: '初期状態が存在しません',
                severity: 'error',
                suggestion: '状態遷移図には少なくとも一つの初期状態が必要です'
            });
        } else if (initialStates.length > 1) {
            this.errors.push({
                type: 'structure',
                message: `初期状態が複数存在します (${initialStates.length}個)`,
                severity: 'error',
                states: initialStates.map(s => s.id),
                suggestion: '初期状態は一つである必要があります'
            });
        }

        // 終了状態のチェック
        const finalStates = states.filter(s => s.type === 'final');
        if (finalStates.length === 0) {
            this.warnings.push({
                type: 'structure',
                message: '終了状態が存在しません',
                severity: 'warning',
                suggestion: '通常、状態遷移図には終了状態があります'
            });
        }

        // 孤立状態のチェック
        this.checkIsolatedStates();

        // 重複遷移のチェック
        this.checkDuplicateTransitions();
    }

    // 孤立状態のチェック
    checkIsolatedStates() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;

        states.forEach(state => {
            const incomingTransitions = transitions.filter(t => t.toState === state);
            const outgoingTransitions = transitions.filter(t => t.fromState === state);

            // 初期状態以外で入力遷移がない状態
            if (state.type !== 'initial' && incomingTransitions.length === 0) {
                this.warnings.push({
                    type: 'reachability',
                    message: `状態「${state.label || '無名'}」に到達する遷移がありません`,
                    severity: 'warning',
                    stateId: state.id,
                    suggestion: '他の状態からこの状態への遷移を追加してください'
                });
            }

            // 終了状態以外で出力遷移がない状態
            if (state.type !== 'final' && outgoingTransitions.length === 0) {
                this.warnings.push({
                    type: 'reachability',
                    message: `状態「${state.label || '無名'}」から出力する遷移がありません`,
                    severity: 'warning',
                    stateId: state.id,
                    suggestion: 'この状態から他の状態への遷移を追加するか、終了状態に変更してください'
                });
            }

            // 完全に孤立した状態
            if (incomingTransitions.length === 0 && outgoingTransitions.length === 0 && state.type === 'normal') {
                this.errors.push({
                    type: 'structure',
                    message: `状態「${state.label || '無名'}」が完全に孤立しています`,
                    severity: 'error',
                    stateId: state.id,
                    suggestion: 'この状態を他の状態と接続するか、削除してください'
                });
            }
        });
    }

    // 重複遷移のチェック
    checkDuplicateTransitions() {
        const transitions = this.engine.transitions;
        const transitionMap = new Map();

        transitions.forEach(transition => {
            const key = `${transition.fromState.id}->${transition.toState.id}`;
            
            if (transitionMap.has(key)) {
                const existing = transitionMap.get(key);
                this.warnings.push({
                    type: 'structure',
                    message: `状態「${transition.fromState.label || '無名'}」から「${transition.toState.label || '無名'}」への遷移が重複しています`,
                    severity: 'warning',
                    transitionIds: [existing.id, transition.id],
                    suggestion: '重複した遷移を統合するか、条件を明確に区別してください'
                });
            } else {
                transitionMap.set(key, transition);
            }
        });
    }

    // 到達可能性の検証
    validateReachability() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;
        const initialStates = states.filter(s => s.type === 'initial');

        if (initialStates.length === 0) {
            return; // 初期状態がない場合は基本構造の検証で既にエラーになっている
        }

        const reachableStates = new Set();
        const queue = [...initialStates];

        // 初期状態から到達可能な全ての状態を探索
        while (queue.length > 0) {
            const currentState = queue.shift();
            if (reachableStates.has(currentState.id)) {
                continue;
            }

            reachableStates.add(currentState.id);

            // この状態からの遷移を探索
            const outgoingTransitions = transitions.filter(t => t.fromState === currentState);
            outgoingTransitions.forEach(transition => {
                if (!reachableStates.has(transition.toState.id)) {
                    queue.push(transition.toState);
                }
            });
        }

        // 到達不可能な状態をチェック
        states.forEach(state => {
            if (!reachableStates.has(state.id)) {
                this.errors.push({
                    type: 'reachability',
                    message: `状態「${state.label || '無名'}」は初期状態から到達不可能です`,
                    severity: 'error',
                    stateId: state.id,
                    suggestion: '初期状態からこの状態への経路を追加してください'
                });
            }
        });

        // 終了状態への到達可能性をチェック
        const finalStates = states.filter(s => s.type === 'final');
        if (finalStates.length > 0) {
            const reachableFinalStates = finalStates.filter(s => reachableStates.has(s.id));
            if (reachableFinalStates.length === 0) {
                this.warnings.push({
                    type: 'reachability',
                    message: '初期状態から終了状態への経路が存在しません',
                    severity: 'warning',
                    suggestion: '初期状態から終了状態への経路を追加してください'
                });
            }
        }
    }

    // 完全性の検証
    validateCompleteness() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;

        // 状態遷移表の完全性をチェック
        const events = this.extractEvents();
        const normalStates = states.filter(s => s.type === 'normal');

        if (events.size > 0 && normalStates.length > 0) {
            normalStates.forEach(state => {
                events.forEach(event => {
                    const hasTransition = transitions.some(t => 
                        t.fromState === state && 
                        (t.label === event || t.label.includes(event))
                    );

                    if (!hasTransition) {
                        this.warnings.push({
                            type: 'completeness',
                            message: `状態「${state.label || '無名'}」でイベント「${event}」の遷移が定義されていません`,
                            severity: 'warning',
                            stateId: state.id,
                            event: event,
                            suggestion: 'この状態でのイベント処理を定義してください'
                        });
                    }
                });
            });
        }
    }

    // イベントを抽出
    extractEvents() {
        const events = new Set();
        const transitions = this.engine.transitions;

        transitions.forEach(transition => {
            if (transition.label) {
                // 簡単なイベント抽出（実際にはより複雑な解析が必要）
                const eventMatches = transition.label.match(/\w+/g);
                if (eventMatches) {
                    eventMatches.forEach(event => events.add(event));
                }
            }
        });

        return events;
    }

    // 命名の検証
    validateNaming() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;

        // 無名状態のチェック
        states.forEach(state => {
            if (!state.label || state.label.trim() === '') {
                this.warnings.push({
                    type: 'naming',
                    message: '無名の状態があります',
                    severity: 'warning',
                    stateId: state.id,
                    suggestion: '状態に意味のある名前を付けてください'
                });
            }
        });

        // 無名遷移のチェック
        transitions.forEach(transition => {
            if (!transition.label || transition.label.trim() === '') {
                this.warnings.push({
                    type: 'naming',
                    message: `状態「${transition.fromState.label || '無名'}」から「${transition.toState.label || '無名'}」への遷移に条件が設定されていません`,
                    severity: 'warning',
                    transitionId: transition.id,
                    suggestion: '遷移条件を明確に記述してください'
                });
            }
        });

        // 重複する状態名のチェック
        const stateNames = new Map();
        states.forEach(state => {
            if (state.label && state.label.trim() !== '') {
                const name = state.label.trim().toLowerCase();
                if (stateNames.has(name)) {
                    const existing = stateNames.get(name);
                    this.warnings.push({
                        type: 'naming',
                        message: `状態名「${state.label}」が重複しています`,
                        severity: 'warning',
                        stateIds: [existing.id, state.id],
                        suggestion: '状態名を一意にしてください'
                    });
                } else {
                    stateNames.set(name, state);
                }
            }
        });
    }

    // ループの検証
    validateLoops() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;

        // 自己ループのチェック
        const selfLoops = transitions.filter(t => t.fromState === t.toState);
        selfLoops.forEach(loop => {
            if (!loop.label || loop.label.trim() === '') {
                this.warnings.push({
                    type: 'loop',
                    message: `状態「${loop.fromState.label || '無名'}」の自己ループに条件が設定されていません`,
                    severity: 'warning',
                    transitionId: loop.id,
                    suggestion: '自己ループには終了条件を明確に記述してください'
                });
            }
        });

        // 無限ループの可能性をチェック
        this.checkInfiniteLoops();

        // デッドロックの可能性をチェック
        this.checkDeadlocks();
    }

    // 無限ループのチェック
    checkInfiniteLoops() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;

        // 強連結成分を探索して無限ループを検出
        const visited = new Set();
        const recursionStack = new Set();

        const dfs = (state, path) => {
            if (recursionStack.has(state.id)) {
                // 循環を発見
                const loopStart = path.indexOf(state.id);
                const loopStates = path.slice(loopStart);
                
                this.warnings.push({
                    type: 'loop',
                    message: `無限ループの可能性があります: ${loopStates.map(id => {
                        const s = states.find(st => st.id === id);
                        return s ? s.label || '無名' : 'unknown';
                    }).join(' → ')}`,
                    severity: 'warning',
                    stateIds: loopStates,
                    suggestion: 'ループから抜け出すための条件を追加してください'
                });
                return;
            }

            if (visited.has(state.id)) {
                return;
            }

            visited.add(state.id);
            recursionStack.add(state.id);
            path.push(state.id);

            const outgoingTransitions = transitions.filter(t => t.fromState === state);
            outgoingTransitions.forEach(transition => {
                dfs(transition.toState, [...path]);
            });

            recursionStack.delete(state.id);
        };

        const initialStates = states.filter(s => s.type === 'initial');
        initialStates.forEach(state => {
            dfs(state, []);
        });
    }

    // デッドロックのチェック
    checkDeadlocks() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;

        states.forEach(state => {
            if (state.type === 'final') return;

            const outgoingTransitions = transitions.filter(t => t.fromState === state);
            
            // 出力遷移がない非終了状態
            if (outgoingTransitions.length === 0) {
                this.warnings.push({
                    type: 'deadlock',
                    message: `状態「${state.label || '無名'}」でデッドロックの可能性があります`,
                    severity: 'warning',
                    stateId: state.id,
                    suggestion: 'この状態から他の状態への遷移を追加するか、終了状態に変更してください'
                });
            }

            // 全ての出力遷移が自己ループの場合
            if (outgoingTransitions.length > 0 && outgoingTransitions.every(t => t.toState === state)) {
                this.warnings.push({
                    type: 'deadlock',
                    message: `状態「${state.label || '無名'}」の全ての遷移が自己ループです`,
                    severity: 'warning',
                    stateId: state.id,
                    suggestion: '他の状態への遷移を追加してください'
                });
            }
        });
    }

    // 検証結果のサマリーを生成
    generateSummary() {
        const stats = this.engine.getStatistics();
        
        return {
            totalStates: stats.stateCount,
            totalTransitions: stats.transitionCount,
            initialStates: stats.initialStates,
            finalStates: stats.finalStates,
            normalStates: stats.normalStates,
            errorCount: this.errors.length,
            warningCount: this.warnings.length,
            isComplete: this.errors.length === 0 && this.warnings.length === 0
        };
    }

    // 特定の状態に関する問題を取得
    getIssuesForState(stateId) {
        const stateIssues = [];
        
        this.errors.forEach(error => {
            if (error.stateId === stateId || (error.stateIds && error.stateIds.includes(stateId))) {
                stateIssues.push(error);
            }
        });
        
        this.warnings.forEach(warning => {
            if (warning.stateId === stateId || (warning.stateIds && warning.stateIds.includes(stateId))) {
                stateIssues.push(warning);
            }
        });
        
        return stateIssues;
    }

    // 特定の遷移に関する問題を取得
    getIssuesForTransition(transitionId) {
        const transitionIssues = [];
        
        this.errors.forEach(error => {
            if (error.transitionId === transitionId || (error.transitionIds && error.transitionIds.includes(transitionId))) {
                transitionIssues.push(error);
            }
        });
        
        this.warnings.forEach(warning => {
            if (warning.transitionId === transitionId || (warning.transitionIds && warning.transitionIds.includes(transitionId))) {
                transitionIssues.push(warning);
            }
        });
        
        return transitionIssues;
    }

    // 問題の修正提案を生成
    generateFixSuggestions() {
        const suggestions = [];

        if (this.errors.some(e => e.type === 'structure' && e.message.includes('初期状態'))) {
            suggestions.push({
                type: 'action',
                message: '初期状態を追加してください',
                action: 'add-initial-state'
            });
        }

        if (this.warnings.some(w => w.type === 'structure' && w.message.includes('終了状態'))) {
            suggestions.push({
                type: 'action',
                message: '終了状態を追加することを検討してください',
                action: 'add-final-state'
            });
        }

        // 無名状態が多い場合
        const namingWarnings = this.warnings.filter(w => w.type === 'naming');
        if (namingWarnings.length > 0) {
            suggestions.push({
                type: 'action',
                message: `${namingWarnings.length}個の状態または遷移に名前を付けてください`,
                action: 'name-elements'
            });
        }

        return suggestions;
    }

    // HTMLレポートを生成
    generateHTMLReport() {
        const summary = this.generateSummary();
        const suggestions = this.generateFixSuggestions();
        
        let html = `
            <div class="validation-report">
                <h3>検証結果</h3>
                
                <div class="summary">
                    <h4>概要</h4>
                    <div class="stats">
                        <div class="stat-item">
                            <span class="label">状態数:</span>
                            <span class="value">${summary.totalStates}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">遷移数:</span>
                            <span class="value">${summary.totalTransitions}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">エラー:</span>
                            <span class="value error">${summary.errorCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">警告:</span>
                            <span class="value warning">${summary.warningCount}</span>
                        </div>
                    </div>
                </div>`;

        if (this.errors.length > 0) {
            html += `
                <div class="errors">
                    <h4>エラー (${this.errors.length}件)</h4>
                    <ul>`;
            
            this.errors.forEach(error => {
                html += `<li class="error-item">
                    <strong>${error.message}</strong>
                    ${error.suggestion ? `<br><small>💡 ${error.suggestion}</small>` : ''}
                </li>`;
            });
            
            html += `</ul></div>`;
        }

        if (this.warnings.length > 0) {
            html += `
                <div class="warnings">
                    <h4>警告 (${this.warnings.length}件)</h4>
                    <ul>`;
            
            this.warnings.forEach(warning => {
                html += `<li class="warning-item">
                    <strong>${warning.message}</strong>
                    ${warning.suggestion ? `<br><small>💡 ${warning.suggestion}</small>` : ''}
                </li>`;
            });
            
            html += `</ul></div>`;
        }

        if (suggestions.length > 0) {
            html += `
                <div class="suggestions">
                    <h4>修正提案</h4>
                    <ul>`;
            
            suggestions.forEach(suggestion => {
                html += `<li class="suggestion-item">${suggestion.message}</li>`;
            });
            
            html += `</ul></div>`;
        }

        if (summary.isComplete) {
            html += `
                <div class="success">
                    <h4>✅ 検証完了</h4>
                    <p>状態遷移図に問題は見つかりませんでした。</p>
                </div>`;
        }

        html += `</div>`;
        
        return html;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ValidationEngine = ValidationEngine;
}