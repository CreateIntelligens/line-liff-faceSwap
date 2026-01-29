#!/bin/bash
# 字體轉換腳本：將 TTF 轉換為 WOFF2

echo "📦 安裝 woff2 工具..."
brew install woff2

echo ""
echo "🔄 開始轉換字體檔案..."

cd resources/assets/fonts

# 轉換匯文明朝體
if [ -f "匯文明朝體.ttf" ]; then
    echo "轉換 匯文明朝體.ttf..."
    woff2_compress "匯文明朝體.ttf"
    if [ -f "匯文明朝體.woff2" ]; then
        echo "✅ 匯文明朝體.woff2 已生成"
        ls -lh "匯文明朝體.woff2"
    fi
fi

# 轉換 NotoSerifHK
if [ -f "NotoSerifHK-VariableFont_wght.ttf" ]; then
    echo "轉換 NotoSerifHK-VariableFont_wght.ttf..."
    woff2_compress "NotoSerifHK-VariableFont_wght.ttf"
    if [ -f "NotoSerifHK-VariableFont_wght.woff2" ]; then
        echo "✅ NotoSerifHK-VariableFont_wght.woff2 已生成"
        ls -lh "NotoSerifHK-VariableFont_wght.woff2"
    fi
fi

echo ""
echo "📊 轉換完成！檔案大小比較："
echo "原始 TTF 檔案："
ls -lh *.ttf 2>/dev/null | awk '{print "  " $9 ": " $5}'
echo ""
echo "轉換後的 WOFF2 檔案："
ls -lh *.woff2 2>/dev/null | awk '{print "  " $9 ": " $5}'
