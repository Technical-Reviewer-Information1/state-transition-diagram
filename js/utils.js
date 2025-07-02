// ユーティリティ関数集

// 数学関数
const MathUtils = {
    // 二点間の距離を計算
    distance: (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // 角度を度からラジアンに変換
    degToRad: (degrees) => degrees * (Math.PI / 180),

    // 角度をラジアンから度に変換
    radToDeg: (radians) => radians * (180 / Math.PI),

    // 二点間の角度を計算（ラジアン）
    angle: (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x),

    // 点が矩形内にあるかチェック
    pointInRect: (point, rect) => {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    },

    // 点が円内にあるかチェック
    pointInCircle: (point, center, radius) => {
        return MathUtils.distance(point, center) <= radius;
    },

    // グリッドにスナップ
    snapToGrid: (value, gridSize) => {
        return Math.round(value / gridSize) * gridSize;
    },

    // 線分と点の最短距離
    distanceToLine: (point, lineStart, lineEnd) => {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
};

// DOM操作ユーティリティ
const DOMUtils = {
    // 要素を取得
    get: (selector) => document.querySelector(selector),
    getAll: (selector) => document.querySelectorAll(selector),

    // クラス操作
    addClass: (element, className) => element.classList.add(className),
    removeClass: (element, className) => element.classList.remove(className),
    toggleClass: (element, className) => element.classList.toggle(className),
    hasClass: (element, className) => element.classList.contains(className),

    // イベントリスナー
    on: (element, event, handler) => element.addEventListener(event, handler),
    off: (element, event, handler) => element.removeEventListener(event, handler),

    // 要素の作成
    create: (tag, attributes = {}, content = '') => {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        if (content) {
            element.textContent = content;
        }
        return element;
    },

    // マウス/タッチ座標を取得
    getEventCoords: (event, element) => {
        const rect = element.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0].clientX) || 0;
        const clientY = event.clientY || (event.touches && event.touches[0].clientY) || 0;
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
};

// 文字列ユーティリティ
const StringUtils = {
    // ランダムなIDを生成
    generateId: (prefix = 'id') => {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // テキストを省略
    truncate: (text, maxLength = 50) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength - 3) + '...';
    },

    // HTML文字をエスケープ
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // 文字列をケバブケースに変換
    toKebabCase: (str) => {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }
};

// 配列ユーティリティ
const ArrayUtils = {
    // 配列から重複を除去
    unique: (array) => [...new Set(array)],

    // 配列をシャッフル
    shuffle: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // 配列の最後の要素を取得
    last: (array) => array[array.length - 1],

    // 配列から要素を削除
    remove: (array, item) => {
        const index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },

    // 配列をグループ化
    groupBy: (array, keyFn) => {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }
};

// オブジェクトユーティリティ
const ObjectUtils = {
    // ディープクローン
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => ObjectUtils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            Object.keys(obj).forEach(key => {
                clonedObj[key] = ObjectUtils.deepClone(obj[key]);
            });
            return clonedObj;
        }
    },

    // オブジェクトをマージ
    merge: (target, ...sources) => {
        sources.forEach(source => {
            Object.keys(source).forEach(key => {
                if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    ObjectUtils.merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            });
        });
        return target;
    },

    // 空のオブジェクトかチェック
    isEmpty: (obj) => {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
};

// ファイル操作ユーティリティ
const FileUtils = {
    // JSONファイルをダウンロード
    downloadJSON: (data, filename = 'diagram.json') => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // ファイルを読み込み
    readFile: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    },

    // 画像をダウンロード
    downloadImage: (canvas, filename = 'diagram.png', quality = 0.9) => {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png', quality);
    }
};

// カラーユーティリティ
const ColorUtils = {
    // HEXからRGBAに変換
    hexToRgba: (hex, alpha = 1) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    // 色を明るくする
    lighten: (color, amount = 0.1) => {
        // 簡易実装（実際にはより複雑な処理が必要）
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 255, 255, ${amount})`;
        return ctx.fillStyle;
    },

    // 色を暗くする
    darken: (color, amount = 0.1) => {
        // 簡易実装（実際にはより複雑な処理が必要）
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(0, 0, 0, ${amount})`;
        return ctx.fillStyle;
    }
};

// 日付ユーティリティ
const DateUtils = {
    // 日付をフォーマット
    format: (date, format = 'YYYY-MM-DD HH:mm:ss') => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    // 相対時間を取得
    timeAgo: (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}日前`;
        if (hours > 0) return `${hours}時間前`;
        if (minutes > 0) return `${minutes}分前`;
        return `${seconds}秒前`;
    }
};

// キーボードイベントユーティリティ
const KeyboardUtils = {
    // キーコンビネーションをチェック
    isKeyCombo: (event, combo) => {
        const keys = combo.toLowerCase().split('+');
        const checks = {
            ctrl: event.ctrlKey || event.metaKey,
            shift: event.shiftKey,
            alt: event.altKey,
            key: event.key.toLowerCase()
        };

        return keys.every(key => {
            if (key === 'ctrl') return checks.ctrl;
            if (key === 'shift') return checks.shift;
            if (key === 'alt') return checks.alt;
            return checks.key === key;
        });
    },

    // ショートカットキーのヘルプテキストを生成
    getShortcutText: (combo) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        return combo.replace('Ctrl', isMac ? '⌘' : 'Ctrl');
    }
};

// URLユーティリティ
const URLUtils = {
    // オブジェクトをURLパラメータに変換
    objectToParams: (obj) => {
        return Object.entries(obj)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    },

    // URLパラメータをオブジェクトに変換
    paramsToObject: (params = window.location.search) => {
        return Object.fromEntries(
            new URLSearchParams(params).entries()
        );
    },

    // Base64エンコード/デコード
    encodeBase64: (str) => btoa(unescape(encodeURIComponent(str))),
    decodeBase64: (str) => decodeURIComponent(escape(atob(str)))
};

// デバウンス・スロットル
const TimingUtils = {
    // デバウンス
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // スロットル
    throttle: (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 検証ユーティリティ
const ValidationUtils = {
    // メールアドレスの検証
    isEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // 空文字チェック
    isEmpty: (value) => {
        return value === null || value === undefined || value === '';
    },

    // 数値チェック
    isNumber: (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },

    // 範囲チェック
    inRange: (value, min, max) => {
        return value >= min && value <= max;
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.MathUtils = MathUtils;
    window.DOMUtils = DOMUtils;
    window.StringUtils = StringUtils;
    window.ArrayUtils = ArrayUtils;
    window.ObjectUtils = ObjectUtils;
    window.FileUtils = FileUtils;
    window.ColorUtils = ColorUtils;
    window.DateUtils = DateUtils;
    window.KeyboardUtils = KeyboardUtils;
    window.URLUtils = URLUtils;
    window.TimingUtils = TimingUtils;
    window.ValidationUtils = ValidationUtils;
}