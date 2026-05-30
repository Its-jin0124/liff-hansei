const GAS_URL = "https://script.google.com/macros/s/AKfycbzhDMFL32HYw65-S9FjEf1dvIZLpPytqosDglErRciFeKpAh8QfRkqcszOA7J0GcLIT/exec";

// 全角70文字ごとに改行
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

// ------------------------------
// 組番号入力 → 自動読み込み
// ------------------------------
document.getElementById("groupNum").addEventListener("change", () => {
  const kumi = document.getElementById("groupNum").value.trim();
  if (!kumi || isNaN(kumi) || kumi < 1 || kumi > 18) return;

  const url = `${GAS_URL}?mode=read&kumi=${encodeURIComponent(kumi)}`;

  fetch(url)
    .then(res => res.json())
    .then(json => {
      if (json.status === "success") {
        document.getElementById("anpi").value  = json.anpi  || "";
        document.getElementById("hinan").value = json.hinan || "";
        document.getElementById("clean").value = json.clean || "";
      }
    })
    .catch(err => console.error("読み込みエラー:", err));
});

// ------------------------------
// 送信処理
// ------------------------------
document.getElementById("sendBtn").addEventListener("click", () => {

  const kumi = document.getElementById("groupNum").value.trim();

  if (!kumi || isNaN(kumi) || kumi < 1 || kumi > 18) {
    alert("組番号は 1〜18 の半角数字で入力してください");
    return;
  }

  // 現在の入力内容
  let anpi  = document.getElementById("anpi").value;
  let hinan = document.getElementById("hinan").value;
  let clean = document.getElementById("clean").value;

  // 既存データがある場合 → 上書き確認
  if (anpi || hinan || clean) {
    if (!confirm("既存の内容があります。上書きしますか？")) {
      return;
    }
  }

  // 送信中表示
  const sendBtn = document.getElementById("sendBtn");
  sendBtn.disabled = true;
  sendBtn.textContent = "送信中です…";

  // 自動改行
  anpi  = wrapText(anpi);
  hinan = wrapText(hinan);
  clean = wrapText(clean);

  // GET 送信
  const url =
    `${GAS_URL}?kumi=${encodeURIComponent(kumi)}` +
    `&anpi=${encodeURIComponent(anpi)}` +
    `&hinan=${encodeURIComponent(hinan)}` +
    `&clean=${encodeURIComponent(clean)}`;

  fetch(url)
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
    })
    .finally(() => {
      sendBtn.disabled = false;
      sendBtn.textContent = "送信";
    });
});
