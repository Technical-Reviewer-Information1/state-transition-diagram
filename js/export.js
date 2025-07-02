// エクスポート機能

class ExportEngine {
    constructor(engine) {
        this.engine = engine;
    }

    // PNG画像として出力
    exportToPNG(options = {}) {
        const {
            scale = 2,
            padding = 50,
            backgroundColor = '#ffffff',
            filename = 'state-diagram.png'
        } = options;

        const bounds = this.getDiagramBounds(padding);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // キャンバスサイズを設定
        canvas.width = bounds.width * scale;
        canvas.height = bounds.height * scale;

        // 高解像度対応
        ctx.scale(scale, scale);

        // 背景色を設定
        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, bounds.width, bounds.height);
        }

        // 原点を調整
        ctx.translate(-bounds.x, -bounds.y);

        // 状態遷移図を描画
        this.renderDiagram(ctx);

        // ダウンロード
        FileUtils.downloadImage(canvas, filename);
        
        return canvas;
    }

    // JPEG画像として出力
    exportToJPEG(options = {}) {
        const {
            scale = 2,
            padding = 50,
            backgroundColor = '#ffffff',
            quality = 0.9,
            filename = 'state-diagram.jpg'
        } = options;

        const bounds = this.getDiagramBounds(padding);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = bounds.width * scale;
        canvas.height = bounds.height * scale;
        ctx.scale(scale, scale);

        // JPEGは透明をサポートしないので背景色は必須
        ctx.fillStyle = backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, bounds.width, bounds.height);

        ctx.translate(-bounds.x, -bounds.y);
        this.renderDiagram(ctx);

        // JPEG形式でダウンロード
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', quality);

        return canvas;
    }

    // SVG形式として出力
    exportToSVG(options = {}) {
        const {
            padding = 50,
            filename = 'state-diagram.svg'
        } = options;

        const bounds = this.getDiagramBounds(padding);
        const svg = this.createSVGDocument(bounds);
        
        // SVGファイルとしてダウンロード
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return svg;
    }

    // PDF形式として出力（将来実装）
    exportToPDF(options = {}) {
        // TODO: PDFライブラリ（jsPDFなど）を使用して実装
        alert('PDF出力は将来のバージョンで実装予定です');
    }

    // 状態遷移表として出力
    exportToTable(format = 'html') {
        const table = this.generateStateTransitionTable();
        
        switch (format) {
            case 'html':
                return this.exportTableAsHTML(table);
            case 'csv':
                return this.exportTableAsCSV(table);
            case 'json':
                return this.exportTableAsJSON(table);
            default:
                throw new Error(`Unsupported table format: ${format}`);
        }
    }

    // URLで共有用のデータを生成
    generateShareableURL(options = {}) {
        const {
            baseURL = window.location.origin + window.location.pathname,
            compress = true
        } = options;

        const data = this.engine.toJSON();
        let encodedData;

        if (compress) {
            // 簡易圧縮（実際の環境では専用ライブラリを使用）
            const jsonString = JSON.stringify(data);
            encodedData = URLUtils.encodeBase64(jsonString);
        } else {
            encodedData = URLUtils.encodeBase64(JSON.stringify(data));
        }

        const shareURL = `${baseURL}?data=${encodedData}`;
        
        // URLが長すぎる場合の警告
        if (shareURL.length > 2000) {
            console.warn('Generated URL is very long and may not work in all browsers');
        }

        return shareURL;
    }

    // QRコードを生成（将来実装）
    generateQRCode(url) {
        // TODO: QRコードライブラリを使用して実装
        console.log('QR Code generation for URL:', url);
        return null;
    }

    // 図形の境界を取得
    getDiagramBounds(padding = 50) {
        const engineBounds = this.engine.getDiagramBounds();
        
        return {
            x: engineBounds.x - padding,
            y: engineBounds.y - padding,
            width: engineBounds.width + padding * 2,
            height: engineBounds.height + padding * 2
        };
    }

    // 状態遷移図を描画
    renderDiagram(ctx) {
        // エンジンのレンダリングロジックを再利用
        ctx.save();
        
        // 遷移を描画
        this.engine.transitions.forEach(transition => {
            transition.draw(ctx);
        });
        
        // 状態を描画
        this.engine.states.forEach(state => {
            // 選択状態を無効化して描画
            const wasSelected = state.selected;
            const wasHovered = state.hovered;
            state.selected = false;
            state.hovered = false;
            
            state.draw(ctx);
            
            // 元の状態を復元
            state.selected = wasSelected;
            state.hovered = wasHovered;
        });
        
        ctx.restore();
    }

    // SVGドキュメントを作成
    createSVGDocument(bounds) {
        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">
<defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#333333" />
    </marker>
</defs>
<rect width="100%" height="100%" fill="white"/>
<g transform="translate(${-bounds.x}, ${-bounds.y})">`;

        // 遷移をSVGで描画
        this.engine.transitions.forEach(transition => {
            svg += this.transitionToSVG(transition);
        });

        // 状態をSVGで描画
        this.engine.states.forEach(state => {
            svg += this.stateToSVG(state);
        });

        svg += `</g></svg>`;
        return svg;
    }

    // 状態をSVGに変換
    stateToSVG(state) {
        const { x, y, radius, type, label, color, borderColor, textColor } = state;
        let svg = '';

        switch (type) {
            case 'initial':
                svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="${borderColor}" stroke-width="2"/>`;
                svg += `<circle cx="${x}" cy="${y}" r="${radius - 8}" fill="${borderColor}"/>`;
                break;
            case 'final':
                svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="${borderColor}" stroke-width="2"/>`;
                svg += `<circle cx="${x}" cy="${y}" r="${radius - 6}" fill="none" stroke="${borderColor}" stroke-width="2"/>`;
                break;
            default:
                svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="${borderColor}" stroke-width="2"/>`;
                break;
        }

        // ラベル
        if (label) {
            svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="${textColor}">${StringUtils.escapeHtml(label)}</text>`;
        }

        return svg;
    }

    // 遷移をSVGに変換
    transitionToSVG(transition) {
        const { fromState, toState, label, color } = transition;
        let svg = '';

        if (transition.isSelfLoop) {
            // 自己ループの描画
            const { x, y, radius } = fromState;
            const loopRadius = 20;
            const centerX = x + radius + loopRadius;
            const centerY = y - radius - loopRadius;

            svg += `<circle cx="${centerX}" cy="${centerY}" r="${loopRadius}" fill="none" stroke="${color}" stroke-width="2" marker-end="url(#arrowhead)"/>`;
            
            if (label) {
                svg += `<text x="${centerX + loopRadius + 10}" y="${centerY}" text-anchor="start" dominant-baseline="middle" font-family="sans-serif" font-size="12" fill="${color}">${StringUtils.escapeHtml(label)}</text>`;
            }
        } else {
            // 通常の遷移の描画
            const startPoint = transition.getStartPoint();
            const endPoint = transition.getEndPoint();

            svg += `<line x1="${startPoint.x}" y1="${startPoint.y}" x2="${endPoint.x}" y2="${endPoint.y}" stroke="${color}" stroke-width="2" marker-end="url(#arrowhead)"/>`;

            if (label) {
                const midX = (startPoint.x + endPoint.x) / 2;
                const midY = (startPoint.y + endPoint.y) / 2;
                svg += `<text x="${midX}" y="${midY - 5}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="12" fill="${color}">${StringUtils.escapeHtml(label)}</text>`;
            }
        }

        return svg;
    }

    // 状態遷移表を生成
    generateStateTransitionTable() {
        const states = this.engine.states;
        const transitions = this.engine.transitions;
        
        // イベントを抽出
        const events = new Set();
        transitions.forEach(t => {
            if (t.label && t.label.trim()) {
                events.add(t.label.trim());
            }
        });

        const eventList = Array.from(events).sort();
        
        // 状態遷移表を構築
        const table = {
            headers: ['現在状態', ...eventList],
            rows: []
        };

        states.forEach(state => {
            const row = [state.label || '無名'];
            
            eventList.forEach(event => {
                const transition = transitions.find(t => 
                    t.fromState === state && t.label === event
                );
                
                if (transition) {
                    row.push(transition.toState.label || '無名');
                } else {
                    row.push('-');
                }
            });
            
            table.rows.push(row);
        });

        return table;
    }

    // 状態遷移表をHTMLとして出力
    exportTableAsHTML(table) {
        let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>状態遷移表</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .export-info { margin-bottom: 20px; color: #666; }
    </style>
</head>
<body>
    <h1>状態遷移表</h1>
    <div class="export-info">
        <p>生成日時: ${DateUtils.format(new Date())}</p>
    </div>
    <table>
        <thead>
            <tr>`;

        table.headers.forEach(header => {
            html += `<th>${StringUtils.escapeHtml(header)}</th>`;
        });

        html += `</tr></thead><tbody>`;

        table.rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${StringUtils.escapeHtml(cell)}</td>`;
            });
            html += '</tr>';
        });

        html += `</tbody></table></body></html>`;

        // HTMLファイルとしてダウンロード
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'state-transition-table.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return html;
    }

    // 状態遷移表をCSVとして出力
    exportTableAsCSV(table) {
        let csv = '';
        
        // ヘッダー
        csv += table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
        
        // データ行
        table.rows.forEach(row => {
            csv += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
        });

        // CSVファイルとしてダウンロード
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'state-transition-table.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return csv;
    }

    // 状態遷移表をJSONとして出力
    exportTableAsJSON(table) {
        const jsonData = {
            metadata: {
                title: '状態遷移表',
                exportedAt: new Date().toISOString(),
                format: 'state-transition-table'
            },
            table: table
        };

        FileUtils.downloadJSON(jsonData, 'state-transition-table.json');
        return jsonData;
    }

    // プリント用のスタイルを適用
    preparePrintView() {
        // プリント時の最適化
        const printStyles = `
            @media print {
                body { margin: 0; }
                .sidebar, .properties-panel, .header, .status-bar { display: none !important; }
                .main-content { flex-direction: row; }
                .canvas-container { width: 100%; height: 100vh; }
                .canvas-toolbar { display: none !important; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = printStyles;
        document.head.appendChild(styleSheet);
        
        return styleSheet;
    }

    // エクスポート設定ダイアログのHTMLを生成
    generateExportDialog() {
        return `
            <div class="export-dialog">
                <h4>エクスポート設定</h4>
                
                <div class="export-tabs">
                    <button class="tab-btn active" data-tab="image">画像</button>
                    <button class="tab-btn" data-tab="vector">ベクター</button>
                    <button class="tab-btn" data-tab="data">データ</button>
                    <button class="tab-btn" data-tab="share">共有</button>
                </div>
                
                <div class="tab-content">
                    <div class="tab-panel active" id="image-panel">
                        <div class="form-group">
                            <label>形式</label>
                            <select id="image-format">
                                <option value="png">PNG (推奨)</option>
                                <option value="jpeg">JPEG</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>解像度</label>
                            <select id="image-scale">
                                <option value="1">標準 (1x)</option>
                                <option value="2" selected>高解像度 (2x)</option>
                                <option value="3">最高解像度 (3x)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>背景色</label>
                            <input type="color" id="bg-color" value="#ffffff">
                        </div>
                        <div class="form-group">
                            <label>余白</label>
                            <input type="number" id="padding" value="50" min="0" max="200">
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="vector-panel">
                        <div class="form-group">
                            <label>形式</label>
                            <select id="vector-format">
                                <option value="svg">SVG</option>
                                <option value="pdf" disabled>PDF (実装予定)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>余白</label>
                            <input type="number" id="vector-padding" value="50" min="0" max="200">
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="data-panel">
                        <div class="form-group">
                            <label>形式</label>
                            <select id="data-format">
                                <option value="json">JSON (図形データ)</option>
                                <option value="table-html">状態遷移表 (HTML)</option>
                                <option value="table-csv">状態遷移表 (CSV)</option>
                                <option value="table-json">状態遷移表 (JSON)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="tab-panel" id="share-panel">
                        <div class="form-group">
                            <label>共有URL</label>
                            <textarea id="share-url" readonly rows="3" placeholder="URLを生成中..."></textarea>
                            <button id="copy-url-btn" class="btn btn-small">コピー</button>
                        </div>
                        <div class="form-group">
                            <label>QRコード</label>
                            <div id="qr-code" style="text-align: center; padding: 20px;">
                                <p>実装予定</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ExportEngine = ExportEngine;
}