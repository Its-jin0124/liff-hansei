window.addEventListener("DOMContentLoaded", () => {

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwYGuYl2B5tr062Q0XsPK4L4lYafT6QPuuusd8Tz9SqKXU0IsOpK2VDyHFZk0IwMX2G/exec";

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

  // 読み込んだ元データを保持
  let loadedAnpi  = "";
  let loadedHinan = "";
  let loadedClean = "";

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

          // 読み込んだ元データを記憶
          loadedAnpi  = json.anpi  || "";
          loadedHinan = json.hinan || "";
          loadedClean = json.clean || "";

          // 画面に反映
          document.getElementById("anpi").value  = loadedAnpi;
          document.getElementById("hinan").value = loadedHinan;
          document.getElementById("clean").value = loadedClean;
        }
      })
      .catch(err => console.error("読み込みエラー:", err));
  });

  // ------------------------------
  // 送信中ダイアログ
  // ------------------------------
  function showSendingDialog() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");

    modalTitle.textContent = "送信中です";
    modalText.textContent = "少しお待ちください…";

    modal.style.display = "flex";
  }

  function hideSendingDialog() {
    document.getElementById("modal").style.display = "none";
  }

  // ------------------------------
  // 送信処理（GET）
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

    // ------------------------------
    // 差分判定（元データと現在の入力を比較）
    // ------------------------------
    const changed =
      (anpi  !== loadedAnpi) ||
      (hinan !== loadedHinan) ||
      (clean !== loadedClean);

    // 元データが空（初回入力）なら確認不要
    const hasLoadedData =
      (loadedAnpi !== "") ||
      (loadedHinan !== "") ||
      (loadedClean !== "");

    // 元データがあり、かつ変更があった場合のみ確認
    if (hasLoadedData && changed) {
      if (!confirm("既存の内容があります。上書きしますか？")) {
        return;
      }
    }

    // 送信中ダイアログ表示
    showSendingDialog();

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
        hideSendingDialog();

        if (json.status === "success") {
          alert("送信しました！");
        } else {
          alert("エラー: " + json.message);
        }
      })
      .catch(err => {
        hideSendingDialog();
        console.error(err);
        alert("送信に失敗しました");
      });
  });

});
