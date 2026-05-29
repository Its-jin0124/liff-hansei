const GAS_URL = "https://script.google.com/macros/s/AKfycbzhDMFL32HYw65-S9FjEf1dvIZLpPytqosDglErRciFeKpAh8QfRkqcszOA7J0GcLIT/exec";


// 全角70文字ごとに改行する関数
function wrapText(text, maxLen = 70) {
  const result = [];
  let line = "";

  for (let char of text) {
    line += char;
    if ([...line].length >= maxLen) {
      result.push(line);
      line = "";
    }
  }
  if (line) result.push(line);

  return result.join("\n");
}

document.getElementById("sendBtn").addEventListener("click", () => {

  const kumi = document.getElementById("groupNum").value.trim();

  if (!kumi || isNaN(kumi) || kumi < 1 || kumi > 18) {
    alert("組番号は 1〜18 の半角数字で入力してください");
    return;
  }

  // 各項目を取得
  let anpi  = document.getElementById("anpi").value;
  let hinan = document.getElementById("hinan").value;
  let clean = document.getElementById("clean").value;

  // 自動改行（全角70文字）
  anpi  = wrapText(anpi);
  hinan = wrapText(hinan);
  clean = wrapText(clean);
fetch(GAS_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain" }, // ← application/json ではなく text/plain
  body: JSON.stringify({
    sheetName: kumi,
    anpi:  anpi,
    hinan: hinan,
    clean: clean
  })
})

  .then(res => res.json())
  .then(json => {
    if (json.status === "success") {
      alert("送信しました！");
    } else {
      alert("エラー: " + json.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("送信に失敗しました");
  });
});
