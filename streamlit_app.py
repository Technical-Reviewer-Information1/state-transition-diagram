import streamlit as st
import graphviz
import common

def main():
    # タイトル表示と共通設定
    st.title("状態遷移図モデリングWebアプリ")
    common.display_header()
    common.set_font()

    # 操作パネルの説明をメイン画面に表示
    st.markdown("### 操作パネル")
    st.markdown("下記のテキストエリアに状態遷移を入力してください。")
    st.markdown("入力例： `状態A -> 状態B` （1行につき1つの遷移）")
    
    # ユーザーから状態遷移の入力を受け付ける
    transitions_input = st.text_area(
        "状態遷移入力（1行につき1つの遷移）",
        "状態A -> 状態B\n状態B -> 状態C\n状態C -> 状態A"
    )

    # 「状態遷移図を生成」ボタンが押された場合の処理
    if st.button("状態遷移図を生成"):
        dot = graphviz.Digraph(format="png")
        
        # 入力された各行を解析し、Graphviz でエッジを生成
        lines = transitions_input.splitlines()
        for line in lines:
            line = line.strip()
            if "->" in line:
                parts = line.split("->")
                if len(parts) == 2:
                    src = parts[0].strip()
                    dst = parts[1].strip()
                    dot.edge(src, dst)
        
        st.subheader("生成された状態遷移図")
        st.graphviz_chart(dot)

    # フッターの表示
    common.display_copyright()

if __name__ == "__main__":
    main()
