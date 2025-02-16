import streamlit as st
import graphviz
import common

def main():
    # タイトル表示と共通設定
    st.title("状態遷移図モデリングWebアプリ")
    common.display_header()
    common.set_font()

    # サイドバーで操作パネルを表示
    st.sidebar.header("操作パネル")
    st.sidebar.markdown("下記のテキストエリアに状態遷移を入力してください。")
    st.sidebar.markdown("入力例： `状態A -> 状態B` （1行につき1つの遷移）")
    
    # ユーザーから状態遷移の入力を受け付ける
    transitions_input = st.sidebar.text_area(
        "状態遷移入力（1行につき1つの遷移）",
        "状態A -> 状態B\n状態B -> 状態C\n状態C -> 状態A"
    )

    # 「状態遷移図を生成」ボタンが押された場合の処理
    if st.sidebar.button("状態遷移図を生成"):
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

    # フッターの各種リンク・情報表示
    common.display_copyright()

if __name__ == "__main__":
    main()
