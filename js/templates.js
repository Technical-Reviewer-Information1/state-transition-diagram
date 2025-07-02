// テンプレート管理システム

class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.loadBuiltinTemplates();
    }

    // 組み込みテンプレートの読み込み
    loadBuiltinTemplates() {
        // 目覚まし時計パターン
        this.registerTemplate('alarm-clock', {
            name: '目覚まし時計',
            description: 'アラーム、スヌーズ機能を持つ目覚まし時計の状態遷移',
            category: 'basic',
            data: {
                states: [
                    {
                        id: 'state_init',
                        x: 100,
                        y: 200,
                        type: 'initial',
                        label: '初期状態',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_off',
                        x: 250,
                        y: 200,
                        type: 'normal',
                        label: 'オフ',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_set',
                        x: 400,
                        y: 200,
                        type: 'normal',
                        label: 'アラーム設定',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_ringing',
                        x: 550,
                        y: 200,
                        type: 'normal',
                        label: 'アラーム鳴動',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_snooze',
                        x: 400,
                        y: 350,
                        type: 'normal',
                        label: 'スヌーズ',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    }
                ],
                transitions: [
                    {
                        id: 'trans_1',
                        fromStateId: 'state_init',
                        toStateId: 'state_off',
                        label: '電源投入',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_2',
                        fromStateId: 'state_off',
                        toStateId: 'state_set',
                        label: 'アラーム設定',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_3',
                        fromStateId: 'state_set',
                        toStateId: 'state_off',
                        label: 'キャンセル',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_4',
                        fromStateId: 'state_set',
                        toStateId: 'state_ringing',
                        label: '設定時刻到達',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_5',
                        fromStateId: 'state_ringing',
                        toStateId: 'state_off',
                        label: 'ストップ',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_6',
                        fromStateId: 'state_ringing',
                        toStateId: 'state_snooze',
                        label: 'スヌーズ',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_7',
                        fromStateId: 'state_snooze',
                        toStateId: 'state_ringing',
                        label: 'スヌーズ時間経過',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_8',
                        fromStateId: 'state_snooze',
                        toStateId: 'state_off',
                        label: 'ストップ',
                        color: '#333333',
                        labelColor: '#333333'
                    }
                ]
            }
        });

        // 自動販売機パターン
        this.registerTemplate('vending-machine', {
            name: '自動販売機',
            description: '待機、選択、決済の基本的な自動販売機の動作',
            category: 'basic',
            data: {
                states: [
                    {
                        id: 'state_init',
                        x: 100,
                        y: 200,
                        type: 'initial',
                        label: '初期状態',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_waiting',
                        x: 250,
                        y: 200,
                        type: 'normal',
                        label: '待機中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_coin_inserted',
                        x: 400,
                        y: 200,
                        type: 'normal',
                        label: '硬貨投入済み',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_item_selected',
                        x: 550,
                        y: 200,
                        type: 'normal',
                        label: '商品選択済み',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_dispensing',
                        x: 700,
                        y: 200,
                        type: 'normal',
                        label: '商品払出中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_change_return',
                        x: 550,
                        y: 350,
                        type: 'normal',
                        label: 'おつり払出中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_completed',
                        x: 400,
                        y: 350,
                        type: 'final',
                        label: '取引完了',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    }
                ],
                transitions: [
                    {
                        id: 'trans_1',
                        fromStateId: 'state_init',
                        toStateId: 'state_waiting',
                        label: '電源投入',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_2',
                        fromStateId: 'state_waiting',
                        toStateId: 'state_coin_inserted',
                        label: '硬貨投入',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_3',
                        fromStateId: 'state_coin_inserted',
                        toStateId: 'state_item_selected',
                        label: '商品選択',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_4',
                        fromStateId: 'state_item_selected',
                        toStateId: 'state_dispensing',
                        label: '金額充足',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_5',
                        fromStateId: 'state_dispensing',
                        toStateId: 'state_change_return',
                        label: '商品払出完了',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_6',
                        fromStateId: 'state_change_return',
                        toStateId: 'state_completed',
                        label: 'おつり払出完了',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_7',
                        fromStateId: 'state_coin_inserted',
                        toStateId: 'state_waiting',
                        label: '返却ボタン',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_8',
                        fromStateId: 'state_item_selected',
                        toStateId: 'state_coin_inserted',
                        label: '金額不足で追加硬貨投入',
                        color: '#333333',
                        labelColor: '#333333'
                    }
                ]
            }
        });

        // ログインシステムパターン
        this.registerTemplate('login-system', {
            name: 'ログインシステム',
            description: '認証、セッション管理を含むログインシステム',
            category: 'system',
            data: {
                states: [
                    {
                        id: 'state_init',
                        x: 100,
                        y: 200,
                        type: 'initial',
                        label: '初期状態',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_login_form',
                        x: 250,
                        y: 200,
                        type: 'normal',
                        label: 'ログイン画面',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_authenticating',
                        x: 400,
                        y: 200,
                        type: 'normal',
                        label: '認証中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_logged_in',
                        x: 550,
                        y: 200,
                        type: 'normal',
                        label: 'ログイン済み',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_auth_failed',
                        x: 400,
                        y: 350,
                        type: 'normal',
                        label: '認証失敗',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_session_expired',
                        x: 550,
                        y: 350,
                        type: 'normal',
                        label: 'セッション期限切れ',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_logout',
                        x: 700,
                        y: 275,
                        type: 'final',
                        label: 'ログアウト',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    }
                ],
                transitions: [
                    {
                        id: 'trans_1',
                        fromStateId: 'state_init',
                        toStateId: 'state_login_form',
                        label: 'アプリ起動',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_2',
                        fromStateId: 'state_login_form',
                        toStateId: 'state_authenticating',
                        label: 'ログイン実行',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_3',
                        fromStateId: 'state_authenticating',
                        toStateId: 'state_logged_in',
                        label: '認証成功',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_4',
                        fromStateId: 'state_authenticating',
                        toStateId: 'state_auth_failed',
                        label: '認証失敗',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_5',
                        fromStateId: 'state_auth_failed',
                        toStateId: 'state_login_form',
                        label: '再試行',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_6',
                        fromStateId: 'state_logged_in',
                        toStateId: 'state_logout',
                        label: 'ログアウト',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_7',
                        fromStateId: 'state_logged_in',
                        toStateId: 'state_session_expired',
                        label: 'セッション期限切れ',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_8',
                        fromStateId: 'state_session_expired',
                        toStateId: 'state_login_form',
                        label: '再ログイン',
                        color: '#333333',
                        labelColor: '#333333'
                    }
                ]
            }
        });

        // ゲーム状態パターン
        this.registerTemplate('game-state', {
            name: 'ゲーム状態',
            description: 'メニュー、プレイ、ポーズ、ゲームオーバーの基本的なゲーム状態',
            category: 'game',
            data: {
                states: [
                    {
                        id: 'state_init',
                        x: 100,
                        y: 275,
                        type: 'initial',
                        label: '初期状態',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_menu',
                        x: 250,
                        y: 275,
                        type: 'normal',
                        label: 'メニュー',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_playing',
                        x: 400,
                        y: 275,
                        type: 'normal',
                        label: 'プレイ中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_paused',
                        x: 400,
                        y: 150,
                        type: 'normal',
                        label: 'ポーズ中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_game_over',
                        x: 550,
                        y: 275,
                        type: 'normal',
                        label: 'ゲームオーバー',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_game_clear',
                        x: 400,
                        y: 400,
                        type: 'normal',
                        label: 'ゲームクリア',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_exit',
                        x: 700,
                        y: 275,
                        type: 'final',
                        label: '終了',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    }
                ],
                transitions: [
                    {
                        id: 'trans_1',
                        fromStateId: 'state_init',
                        toStateId: 'state_menu',
                        label: 'ゲーム起動',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_2',
                        fromStateId: 'state_menu',
                        toStateId: 'state_playing',
                        label: 'ゲーム開始',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_3',
                        fromStateId: 'state_playing',
                        toStateId: 'state_paused',
                        label: 'ポーズ',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_4',
                        fromStateId: 'state_paused',
                        toStateId: 'state_playing',
                        label: '再開',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_5',
                        fromStateId: 'state_playing',
                        toStateId: 'state_game_over',
                        label: 'ライフ0',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_6',
                        fromStateId: 'state_playing',
                        toStateId: 'state_game_clear',
                        label: 'ステージクリア',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_7',
                        fromStateId: 'state_game_over',
                        toStateId: 'state_menu',
                        label: 'リトライ',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_8',
                        fromStateId: 'state_game_clear',
                        toStateId: 'state_menu',
                        label: 'メニューに戻る',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_9',
                        fromStateId: 'state_paused',
                        toStateId: 'state_menu',
                        label: 'メニューに戻る',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_10',
                        fromStateId: 'state_menu',
                        toStateId: 'state_exit',
                        label: 'ゲーム終了',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_11',
                        fromStateId: 'state_game_over',
                        toStateId: 'state_exit',
                        label: 'ゲーム終了',
                        color: '#333333',
                        labelColor: '#333333'
                    }
                ]
            }
        });

        // 通信プロトコルパターン
        this.registerTemplate('communication-protocol', {
            name: '通信プロトコル',
            description: '接続、データ転送、切断の基本的な通信プロトコル',
            category: 'system',
            data: {
                states: [
                    {
                        id: 'state_init',
                        x: 100,
                        y: 200,
                        type: 'initial',
                        label: '初期状態',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_idle',
                        x: 250,
                        y: 200,
                        type: 'normal',
                        label: 'アイドル',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_connecting',
                        x: 400,
                        y: 200,
                        type: 'normal',
                        label: '接続中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_connected',
                        x: 550,
                        y: 200,
                        type: 'normal',
                        label: '接続済み',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_transferring',
                        x: 700,
                        y: 200,
                        type: 'normal',
                        label: 'データ転送中',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_error',
                        x: 400,
                        y: 350,
                        type: 'normal',
                        label: 'エラー状態',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    },
                    {
                        id: 'state_disconnected',
                        x: 550,
                        y: 350,
                        type: 'final',
                        label: '切断',
                        radius: 30,
                        color: '#ffffff',
                        borderColor: '#333333',
                        textColor: '#333333'
                    }
                ],
                transitions: [
                    {
                        id: 'trans_1',
                        fromStateId: 'state_init',
                        toStateId: 'state_idle',
                        label: 'システム起動',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_2',
                        fromStateId: 'state_idle',
                        toStateId: 'state_connecting',
                        label: '接続要求',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_3',
                        fromStateId: 'state_connecting',
                        toStateId: 'state_connected',
                        label: '接続成功',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_4',
                        fromStateId: 'state_connecting',
                        toStateId: 'state_error',
                        label: '接続失敗',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_5',
                        fromStateId: 'state_connected',
                        toStateId: 'state_transferring',
                        label: 'データ送信開始',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_6',
                        fromStateId: 'state_transferring',
                        toStateId: 'state_connected',
                        label: '転送完了',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_7',
                        fromStateId: 'state_connected',
                        toStateId: 'state_disconnected',
                        label: '切断要求',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_8',
                        fromStateId: 'state_transferring',
                        toStateId: 'state_error',
                        label: '転送エラー',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_9',
                        fromStateId: 'state_error',
                        toStateId: 'state_idle',
                        label: 'リセット',
                        color: '#333333',
                        labelColor: '#333333'
                    },
                    {
                        id: 'trans_10',
                        fromStateId: 'state_error',
                        toStateId: 'state_disconnected',
                        label: '強制切断',
                        color: '#333333',
                        labelColor: '#333333'
                    }
                ]
            }
        });
    }

    // テンプレートを登録
    registerTemplate(id, template) {
        this.templates.set(id, {
            id,
            ...template,
            createdAt: new Date().toISOString()
        });
    }

    // テンプレートを取得
    getTemplate(id) {
        return this.templates.get(id);
    }

    // 全テンプレートを取得
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    // カテゴリ別テンプレートを取得
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(template => template.category === category);
    }

    // テンプレート一覧をHTMLで生成
    generateTemplateListHTML() {
        const templates = this.getAllTemplates();
        const categories = ArrayUtils.groupBy(templates, t => t.category);
        
        let html = '<div class="template-list">';
        
        Object.entries(categories).forEach(([category, templates]) => {
            const categoryNames = {
                'basic': '基本パターン',
                'system': 'システム',
                'game': 'ゲーム',
                'custom': 'カスタム'
            };
            
            html += `
                <div class="template-category">
                    <h4>${categoryNames[category] || category}</h4>
                    <div class="template-grid">`;
            
            templates.forEach(template => {
                html += `
                    <div class="template-card" data-template="${template.id}">
                        <div class="template-preview">
                            <canvas width="120" height="80" data-preview="${template.id}"></canvas>
                        </div>
                        <div class="template-info">
                            <h5>${template.name}</h5>
                            <p>${template.description}</p>
                            <button class="btn btn-small apply-template-btn" data-template="${template.id}">
                                適用
                            </button>
                        </div>
                    </div>`;
            });
            
            html += `
                    </div>
                </div>`;
        });
        
        html += '</div>';
        return html;
    }

    // テンプレートのプレビューを生成
    generateTemplatePreview(templateId, canvas) {
        const template = this.getTemplate(templateId);
        if (!template) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        // キャンバスをクリア
        ctx.clearRect(0, 0, width, height);
        
        // 背景
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);
        
        // スケールを計算
        const bounds = this.calculateTemplateBounds(template.data);
        const scaleX = (width - 20) / bounds.width;
        const scaleY = (height - 20) / bounds.height;
        const scale = Math.min(scaleX, scaleY, 1);
        
        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(10 / scale - bounds.x, 10 / scale - bounds.y);
        
        // 状態を描画（簡易版）
        template.data.states.forEach(stateData => {
            this.drawPreviewState(ctx, stateData);
        });
        
        // 遷移を描画（簡易版）
        template.data.transitions.forEach(transitionData => {
            this.drawPreviewTransition(ctx, transitionData, template.data.states);
        });
        
        ctx.restore();
    }

    // テンプレートの境界を計算
    calculateTemplateBounds(data) {
        if (data.states.length === 0) {
            return { x: 0, y: 0, width: 100, height: 100 };
        }
        
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        data.states.forEach(state => {
            const radius = state.radius || 30;
            minX = Math.min(minX, state.x - radius);
            minY = Math.min(minY, state.y - radius);
            maxX = Math.max(maxX, state.x + radius);
            maxY = Math.max(maxY, state.y + radius);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    // プレビュー用状態描画
    drawPreviewState(ctx, stateData) {
        const { x, y, radius = 30, type, label } = stateData;
        const scaledRadius = Math.max(radius * 0.5, 8); // プレビュー用に縮小
        
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        
        // 状態の種類に応じて描画
        switch (type) {
            case 'initial':
                ctx.beginPath();
                ctx.arc(x, y, scaledRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(x, y, scaledRadius - 3, 0, 2 * Math.PI);
                ctx.fill();
                break;
            case 'final':
                ctx.beginPath();
                ctx.arc(x, y, scaledRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, scaledRadius - 3, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            default:
                ctx.beginPath();
                ctx.arc(x, y, scaledRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
        }
        
        // ラベル（簡略化）
        if (label && scaledRadius > 12) {
            ctx.fillStyle = '#333333';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const truncatedLabel = label.length > 6 ? label.substring(0, 6) + '...' : label;
            ctx.fillText(truncatedLabel, x, y);
        }
        
        ctx.restore();
    }

    // プレビュー用遷移描画
    drawPreviewTransition(ctx, transitionData, states) {
        const fromState = states.find(s => s.id === transitionData.fromStateId);
        const toState = states.find(s => s.id === transitionData.toStateId);
        
        if (!fromState || !toState) return;
        
        ctx.save();
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        
        if (fromState === toState) {
            // 自己ループ（簡易版）
            const radius = 8;
            const centerX = fromState.x + 15;
            const centerY = fromState.y - 15;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            // 直線遷移
            ctx.beginPath();
            ctx.moveTo(fromState.x, fromState.y);
            ctx.lineTo(toState.x, toState.y);
            ctx.stroke();
            
            // 矢印（簡易版）
            const angle = Math.atan2(toState.y - fromState.y, toState.x - fromState.x);
            const arrowLength = 6;
            const arrowAngle = Math.PI / 6;
            
            ctx.beginPath();
            ctx.moveTo(toState.x, toState.y);
            ctx.lineTo(
                toState.x - arrowLength * Math.cos(angle - arrowAngle),
                toState.y - arrowLength * Math.sin(angle - arrowAngle)
            );
            ctx.moveTo(toState.x, toState.y);
            ctx.lineTo(
                toState.x - arrowLength * Math.cos(angle + arrowAngle),
                toState.y - arrowLength * Math.sin(angle + arrowAngle)
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // カスタムテンプレートを作成
    createCustomTemplate(name, description, engineData) {
        const id = StringUtils.generateId('custom-template');
        
        const template = {
            name,
            description,
            category: 'custom',
            data: ObjectUtils.deepClone(engineData)
        };
        
        this.registerTemplate(id, template);
        this.saveCustomTemplates();
        
        return id;
    }

    // テンプレートを削除
    deleteTemplate(id) {
        const template = this.getTemplate(id);
        if (template && template.category === 'custom') {
            this.templates.delete(id);
            this.saveCustomTemplates();
            return true;
        }
        return false;
    }

    // カスタムテンプレートをローカルストレージに保存
    saveCustomTemplates() {
        const customTemplates = this.getTemplatesByCategory('custom');
        const data = {};
        
        customTemplates.forEach(template => {
            data[template.id] = template;
        });
        
        try {
            localStorage.setItem('customTemplates', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save custom templates:', error);
        }
    }

    // カスタムテンプレートをローカルストレージから読み込み
    loadCustomTemplates() {
        try {
            const data = localStorage.getItem('customTemplates');
            if (data) {
                const customTemplates = JSON.parse(data);
                Object.entries(customTemplates).forEach(([id, template]) => {
                    this.templates.set(id, template);
                });
            }
        } catch (error) {
            console.warn('Failed to load custom templates:', error);
        }
    }

    // テンプレート検索
    searchTemplates(query) {
        const searchTerm = query.toLowerCase();
        return this.getAllTemplates().filter(template => 
            template.name.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm)
        );
    }

    // テンプレートをJSONでエクスポート
    exportTemplate(id) {
        const template = this.getTemplate(id);
        if (template) {
            FileUtils.downloadJSON(template, `template-${template.name}.json`);
        }
    }

    // JSONからテンプレートをインポート
    async importTemplate(file) {
        try {
            const content = await FileUtils.readFile(file);
            const templateData = JSON.parse(content);
            
            // テンプレートデータの検証
            if (!templateData.name || !templateData.data) {
                throw new Error('Invalid template format');
            }
            
            const id = this.createCustomTemplate(
                templateData.name,
                templateData.description || 'インポートされたテンプレート',
                templateData.data
            );
            
            return id;
        } catch (error) {
            throw new Error(`Template import failed: ${error.message}`);
        }
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.TemplateManager = TemplateManager;
}