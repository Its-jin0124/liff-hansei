const GAS_URL = "https://script.google.com/macros/s/AKfycbxlsbhxFHbnC8UNkQV0QIpEvRSz_ySKeQzrjTQaTqIPTwgpCb45uXjKUYeNYPbl4zSR/exec";

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

document.getElementById("sendBtn").addEventListener("click", () => {

  const kumi = document.getElementById("groupNum").value.trim();

  if (!kumi || isNaN(kumi) || kumi < 1 || kumi > 18) {
    alert("組番号は 1〜18 の半角数字で入力してください");
    return;
  }

  let anpi  = wrapText(document.getElementById("anpi").value);
  let hinan = wrapText(document.getElementById("hinan").value);
  let clean = wrapText(document.getElementById("clean").value);

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
    });
});
