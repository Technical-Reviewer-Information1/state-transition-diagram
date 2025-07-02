// 状態遷移表生成エンジン

class StateTableGenerator {
    constructor(engine) {
        this.engine = engine;
    }

    // 状態遷移表を生成
    generateTable(options = {}) {
        const {
            includeEmptyTransitions = true,
            groupByEvent = false,
            sortStates = true,
            sortEvents = true
        } = options;

        const states = this.getStates(sortStates);
        const events = this.getEvents(sortEvents);
        const transitions = this.engine.transitions;

        if (groupByEvent) {
            return this.generateEventGroupedTable(states, events, transitions, includeEmptyTransitions);
        } else {
            return this.generateStandardTable(states, events, transitions, includeEmptyTransitions);
        }
    }

    // 標準的な状態遷移表を生成
    generateStandardTable(states, events, transitions, includeEmptyTransitions) {
        const table = {
            type: 'standard',
            headers: ['現在状態', ...events],
            rows: [],
            metadata: {
                stateCount: states.length,
                eventCount: events.length,
                transitionCount: transitions.length,
                generatedAt: new Date().toISOString()
            }
        };

        states.forEach(state => {
            const row = [this.getStateDisplayName(state)];
            
            events.forEach(event => {
                const transition = this.findTransition(state, event, transitions);
                if (transition) {
                    row.push(this.getStateDisplayName(transition.toState));
                } else {
                    row.push(includeEmptyTransitions ? '-' : '');
                }
            });
            
            table.rows.push(row);
        });

        return table;
    }

    // イベント別にグループ化した表を生成
    generateEventGroupedTable(states, events, transitions, includeEmptyTransitions) {
        const tables = [];

        events.forEach(event => {
            const table = {
                type: 'event-grouped',
                event: event,
                headers: ['現在状態', '次状態', '条件'],
                rows: [],
                metadata: {
                    event: event,
                    generatedAt: new Date().toISOString()
                }
            };

            states.forEach(state => {
                const transition = this.findTransition(state, event, transitions);
                if (transition || includeEmptyTransitions) {
                    const row = [
                        this.getStateDisplayName(state),
                        transition ? this.getStateDisplayName(transition.toState) : '-',
                        transition ? (transition.label || event) : '-'
                    ];
                    table.rows.push(row);
                }
            });

            tables.push(table);
        });

        return {
            type: 'event-grouped',
            tables: tables,
            metadata: {
                eventCount: events.length,
                stateCount: states.length,
                generatedAt: new Date().toISOString()
            }
        };
    }

    // 決定表形式での生成
    generateDecisionTable() {
        const states = this.getStates(true);
        const events = this.getEvents(true);
        const transitions = this.engine.transitions;

        const table = {
            type: 'decision',
            headers: ['条件'],
            conditions: [],
            actions: [],
            rules: [],
            metadata: {
                generatedAt: new Date().toISOString()
            }
        };

        // 条件（現在状態とイベント）を設定
        table.conditions = [
            '現在状態',
            'イベント'
        ];

        // アクション（次状態）を設定
        table.actions = [
            '次状態',
            '実行アクション'
        ];

        // ヘッダーにルール番号を追加
        let ruleNumber = 1;
        states.forEach(state => {
            events.forEach(event => {
                const transition = this.findTransition(state, event, transitions);
                if (transition) {
                    table.headers.push(`R${ruleNumber++}`);
                }
            });
        });

        // ルールを生成
        ruleNumber = 1;
        states.forEach(state => {
            events.forEach(event => {
                const transition = this.findTransition(state, event, transitions);
                if (transition) {
                    const rule = {
                        id: `R${ruleNumber++}`,
                        conditions: [
                            this.getStateDisplayName(state),
                            event
                        ],
                        actions: [
                            this.getStateDisplayName(transition.toState),
                            this.extractAction(transition)
                        ]
                    };
                    table.rules.push(rule);
                }
            });
        });

        return table;
    }

    // マトリックス形式での生成
    generateMatrix() {
        const states = this.getStates(true);
        const matrix = {
            type: 'matrix',
            states: states.map(s => this.getStateDisplayName(s)),
            transitions: [],
            metadata: {
                stateCount: states.length,
                generatedAt: new Date().toISOString()
            }
        };

        // 状態間の遷移マトリックスを生成
        states.forEach((fromState, fromIndex) => {
            const row = [];
            states.forEach((toState, toIndex) => {
                const transitions = this.engine.transitions.filter(t => 
                    t.fromState === fromState && t.toState === toState
                );
                
                if (transitions.length > 0) {
                    row.push(transitions.map(t => t.label || 'ε').join(', '));
                } else {
                    row.push(fromIndex === toIndex ? '·' : '');
                }
            });
            matrix.transitions.push(row);
        });

        return matrix;
    }

    // 状態を取得（ソート可能）
    getStates(sort = true) {
        let states = [...this.engine.states];
        
        if (sort) {
            states.sort((a, b) => {
                // 初期状態を最初に
                if (a.type === 'initial') return -1;
                if (b.type === 'initial') return 1;
                
                // 終了状態を最後に
                if (a.type === 'final') return 1;
                if (b.type === 'final') return -1;
                
                // 名前でソート
                const aName = a.label || a.id;
                const bName = b.label || b.id;
                return aName.localeCompare(bName);
            });
        }
        
        return states;
    }

    // イベントを抽出（ソート可能）
    getEvents(sort = true) {
        const eventSet = new Set();
        
        this.engine.transitions.forEach(transition => {
            if (transition.label && transition.label.trim()) {
                // 複数条件がある場合は分割
                const events = this.parseTransitionLabel(transition.label);
                events.forEach(event => eventSet.add(event));
            }
        });

        let events = Array.from(eventSet);
        
        if (sort) {
            events.sort((a, b) => a.localeCompare(b));
        }
        
        return events;
    }

    // 遷移ラベルを解析してイベントを抽出
    parseTransitionLabel(label) {
        // 簡単な解析（実際にはより複雑な解析が必要）
        const events = [];
        
        // カンマ区切りで分割
        const parts = label.split(/[,;|]/).map(part => part.trim());
        parts.forEach(part => {
            if (part) {
                // 条件部分を抽出（例：event[condition] → event）
                const match = part.match(/^([^[\(]+)/);
                if (match) {
                    events.push(match[1].trim());
                } else {
                    events.push(part);
                }
            }
        });
        
        return events.length > 0 ? events : [label.trim()];
    }

    // 指定した状態とイベントの遷移を検索
    findTransition(fromState, event, transitions) {
        return transitions.find(transition => {
            if (transition.fromState !== fromState) return false;
            
            const events = this.parseTransitionLabel(transition.label || '');
            return events.includes(event);
        });
    }

    // 状態の表示名を取得
    getStateDisplayName(state) {
        if (!state) return '(未定義)';
        
        let name = state.label || state.id || '無名';
        
        // 状態タイプを示す記号を追加
        switch (state.type) {
            case 'initial':
                name = `→${name}`;
                break;
            case 'final':
                name = `${name}■`;
                break;
        }
        
        return name;
    }

    // 遷移からアクションを抽出
    extractAction(transition) {
        const label = transition.label || '';
        
        // アクション部分を抽出（例：event/action → action）
        const actionMatch = label.match(/\/(.+)$/);
        if (actionMatch) {
            return actionMatch[1].trim();
        }
        
        // ガード条件を除いたイベント名
        const eventMatch = label.match(/^([^\/\[]+)/);
        if (eventMatch) {
            return `遷移: ${eventMatch[1].trim()}`;
        }
        
        return '遷移実行';
    }

    // HTMLテーブルとして出力
    generateHTMLTable(tableData, options = {}) {
        const {
            cssClass = 'state-table',
            includeHeader = true,
            includeFooter = true,
            responsive = true
        } = options;

        let html = '';
        
        if (includeHeader) {
            html += this.generateHTMLHeader(tableData);
        }

        if (tableData.type === 'event-grouped') {
            html += this.generateEventGroupedHTML(tableData, cssClass, responsive);
        } else if (tableData.type === 'decision') {
            html += this.generateDecisionTableHTML(tableData, cssClass, responsive);
        } else if (tableData.type === 'matrix') {
            html += this.generateMatrixHTML(tableData, cssClass, responsive);
        } else {
            html += this.generateStandardHTML(tableData, cssClass, responsive);
        }

        if (includeFooter) {
            html += this.generateHTMLFooter(tableData);
        }

        return html;
    }

    // 標準テーブルのHTML生成
    generateStandardHTML(tableData, cssClass, responsive) {
        let html = `<div class="${cssClass}-container${responsive ? ' responsive' : ''}">`;
        html += `<table class="${cssClass}">`;
        
        // ヘッダー
        html += '<thead><tr>';
        tableData.headers.forEach(header => {
            html += `<th>${StringUtils.escapeHtml(header)}</th>`;
        });
        html += '</tr></thead>';
        
        // ボディ
        html += '<tbody>';
        tableData.rows.forEach((row, rowIndex) => {
            html += `<tr class="${rowIndex % 2 === 0 ? 'even' : 'odd'}">`;
            row.forEach((cell, cellIndex) => {
                const isStateCell = cellIndex === 0;
                const isEmpty = cell === '-' || cell === '';
                const cellClass = isStateCell ? 'state-cell' : (isEmpty ? 'empty-cell' : 'transition-cell');
                html += `<td class="${cellClass}">${StringUtils.escapeHtml(cell)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table></div>';
        return html;
    }

    // イベントグループテーブルのHTML生成
    generateEventGroupedHTML(tableData, cssClass, responsive) {
        let html = `<div class="${cssClass}-container${responsive ? ' responsive' : ''}">`;
        
        tableData.tables.forEach((table, index) => {
            html += `<div class="event-table-section">`;
            html += `<h4>イベント: ${StringUtils.escapeHtml(table.event)}</h4>`;
            html += `<table class="${cssClass}">`;
            
            // ヘッダー
            html += '<thead><tr>';
            table.headers.forEach(header => {
                html += `<th>${StringUtils.escapeHtml(header)}</th>`;
            });
            html += '</tr></thead>';
            
            // ボディ
            html += '<tbody>';
            table.rows.forEach((row, rowIndex) => {
                html += `<tr class="${rowIndex % 2 === 0 ? 'even' : 'odd'}">`;
                row.forEach((cell, cellIndex) => {
                    const cellClass = cellIndex === 0 ? 'state-cell' : 'transition-cell';
                    html += `<td class="${cellClass}">${StringUtils.escapeHtml(cell)}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';
            
            html += '</table>';
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    // 決定表のHTML生成
    generateDecisionTableHTML(tableData, cssClass, responsive) {
        let html = `<div class="${cssClass}-container decision-table${responsive ? ' responsive' : ''}">`;
        html += `<table class="${cssClass}">`;
        
        // ヘッダー行
        html += '<thead>';
        html += '<tr>';
        html += '<th rowspan="2">条件/アクション</th>';
        tableData.rules.forEach(rule => {
            html += `<th>${StringUtils.escapeHtml(rule.id)}</th>`;
        });
        html += '</tr>';
        html += '</thead>';
        
        // 条件行
        html += '<tbody>';
        tableData.conditions.forEach((condition, condIndex) => {
            html += '<tr class="condition-row">';
            html += `<td class="condition-label">${StringUtils.escapeHtml(condition)}</td>`;
            tableData.rules.forEach(rule => {
                html += `<td class="condition-cell">${StringUtils.escapeHtml(rule.conditions[condIndex] || '')}</td>`;
            });
            html += '</tr>';
        });
        
        // 区切り行
        html += '<tr class="separator"><td colspan="' + (tableData.rules.length + 1) + '"></td></tr>';
        
        // アクション行
        tableData.actions.forEach((action, actionIndex) => {
            html += '<tr class="action-row">';
            html += `<td class="action-label">${StringUtils.escapeHtml(action)}</td>`;
            tableData.rules.forEach(rule => {
                html += `<td class="action-cell">${StringUtils.escapeHtml(rule.actions[actionIndex] || '')}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        return html;
    }

    // マトリックスのHTML生成
    generateMatrixHTML(tableData, cssClass, responsive) {
        let html = `<div class="${cssClass}-container matrix-table${responsive ? ' responsive' : ''}">`;
        html += `<table class="${cssClass}">`;
        
        // ヘッダー
        html += '<thead><tr>';
        html += '<th class="matrix-corner">From \\ To</th>';
        tableData.states.forEach(state => {
            html += `<th class="state-header">${StringUtils.escapeHtml(state)}</th>`;
        });
        html += '</tr></thead>';
        
        // ボディ
        html += '<tbody>';
        tableData.states.forEach((fromState, fromIndex) => {
            html += '<tr>';
            html += `<th class="state-header">${StringUtils.escapeHtml(fromState)}</th>`;
            tableData.transitions[fromIndex].forEach((transition, toIndex) => {
                const isEmpty = !transition || transition === '·';
                const isSelf = fromIndex === toIndex && transition === '·';
                const cellClass = isEmpty ? (isSelf ? 'self-cell' : 'empty-cell') : 'transition-cell';
                html += `<td class="${cellClass}">${StringUtils.escapeHtml(transition || '')}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table></div>';
        return html;
    }

    // HTMLヘッダーの生成
    generateHTMLHeader(tableData) {
        return `
            <div class="table-header">
                <h3>状態遷移表</h3>
                <div class="table-metadata">
                    <span>生成日時: ${DateUtils.format(new Date(tableData.metadata.generatedAt))}</span>
                    ${tableData.metadata.stateCount ? `<span>状態数: ${tableData.metadata.stateCount}</span>` : ''}
                    ${tableData.metadata.eventCount ? `<span>イベント数: ${tableData.metadata.eventCount}</span>` : ''}
                    ${tableData.metadata.transitionCount ? `<span>遷移数: ${tableData.metadata.transitionCount}</span>` : ''}
                </div>
            </div>`;
    }

    // HTMLフッターの生成
    generateHTMLFooter(tableData) {
        return `
            <div class="table-footer">
                <div class="legend">
                    <h4>凡例</h4>
                    <ul>
                        <li><strong>→状態名</strong>: 初期状態</li>
                        <li><strong>状態名■</strong>: 終了状態</li>
                        <li><strong>-</strong>: 遷移なし</li>
                        <li><strong>·</strong>: 自己状態（マトリックス表示）</li>
                    </ul>
                </div>
            </div>`;
    }

    // CSVとして出力
    generateCSV(tableData) {
        let csv = '';
        
        if (tableData.type === 'event-grouped') {
            tableData.tables.forEach((table, index) => {
                if (index > 0) csv += '\n';
                csv += `イベント: ${table.event}\n`;
                csv += table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
                table.rows.forEach(row => {
                    csv += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
                });
            });
        } else {
            // 標準形式
            csv += tableData.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
            tableData.rows.forEach(row => {
                csv += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
            });
        }
        
        return csv;
    }

    // JSON形式で出力
    generateJSON(tableData) {
        return {
            ...tableData,
            exportedAt: new Date().toISOString(),
            exportFormat: 'json'
        };
    }

    // 表の統計情報を生成
    generateStatistics(tableData) {
        const stats = {
            totalStates: 0,
            totalEvents: 0,
            totalTransitions: 0,
            emptyTransitions: 0,
            selfTransitions: 0,
            coverage: 0
        };

        if (tableData.type === 'standard') {
            stats.totalStates = tableData.rows.length;
            stats.totalEvents = tableData.headers.length - 1;
            
            let filledCells = 0;
            let selfTransitions = 0;
            
            tableData.rows.forEach((row, stateIndex) => {
                row.slice(1).forEach((cell, eventIndex) => {
                    if (cell && cell !== '-') {
                        filledCells++;
                        // 自己遷移のチェック（状態名が同じ場合）
                        if (cell === row[0]) {
                            selfTransitions++;
                        }
                    }
                });
            });
            
            stats.totalTransitions = filledCells;
            stats.emptyTransitions = (stats.totalStates * stats.totalEvents) - filledCells;
            stats.selfTransitions = selfTransitions;
            stats.coverage = stats.totalStates * stats.totalEvents > 0 ? 
                (filledCells / (stats.totalStates * stats.totalEvents) * 100).toFixed(1) : 0;
        }

        return stats;
    }

    // 表の品質チェック
    validateTable(tableData) {
        const issues = [];
        
        if (tableData.type === 'standard') {
            // 空の遷移が多い場合
            const stats = this.generateStatistics(tableData);
            if (stats.coverage < 50) {
                issues.push({
                    type: 'warning',
                    message: `遷移の充足率が低い (${stats.coverage}%)`
                });
            }
            
            // 到達不可能な状態のチェック
            const reachableStates = this.findReachableStates(tableData);
            if (reachableStates.size < tableData.rows.length) {
                issues.push({
                    type: 'error',
                    message: '到達不可能な状態があります'
                });
            }
        }
        
        return issues;
    }

    // 到達可能な状態を検索
    findReachableStates(tableData) {
        const reachableStates = new Set();
        const queue = [];
        
        // 初期状態を探す（→記号がついている状態）
        tableData.rows.forEach((row, index) => {
            if (row[0].startsWith('→')) {
                reachableStates.add(index);
                queue.push(index);
            }
        });
        
        // 幅優先探索で到達可能な状態を探索
        while (queue.length > 0) {
            const currentIndex = queue.shift();
            const currentRow = tableData.rows[currentIndex];
            
            // この状態からの全ての遷移をチェック
            currentRow.slice(1).forEach(nextStateName => {
                if (nextStateName && nextStateName !== '-') {
                    const nextStateIndex = tableData.rows.findIndex(row => 
                        row[0] === nextStateName || row[0] === `→${nextStateName}` || row[0] === `${nextStateName}■`
                    );
                    
                    if (nextStateIndex !== -1 && !reachableStates.has(nextStateIndex)) {
                        reachableStates.add(nextStateIndex);
                        queue.push(nextStateIndex);
                    }
                }
            });
        }
        
        return reachableStates;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.StateTableGenerator = StateTableGenerator;
}