window.addEventListener("DOMContentLoaded", () => {

  // ★ デプロイ後の /exec URL をここに貼る
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxvw-jlt-CIqwE8u9HcIbffk97kq5kyKIv6-Y_Vf2-_V3JDCQd6zfwAsmEqKRCoWBf5/exec";

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

  // 読み込んだ元データを保持（2項目）
  let loadedAnpi  = "";
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
          loadedClean = json.clean || "";

          // 画面に反映
          document.getElementById("anpi").value  = loadedAnpi;
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
  // 上書き確認モーダル
  // ------------------------------
  function showOverwriteDialog(onOK) {
    const modal = document.getElementById("modal");
    const title = document.getElementById("modalTitle");
    const text  = document.getElementById("modalText");

    title.textContent = "確認";
    text.textContent = "既存の内容があります。上書きしますか？";

    const closeBtn = document.getElementById("closeBtn");
    closeBtn.textContent = "キャンセル";

    // 既存の OK ボタンが残らないように削除
    const oldOk = document.getElementById("overwriteOkBtn");
    if (oldOk) oldOk.remove();

    // OK ボタン追加
    const okBtn = document.createElement("button");
    okBtn.id = "overwriteOkBtn";
    okBtn.textContent = "OK";
    okBtn.style.marginLeft = "10px";
    okBtn.style.padding = "8px 16px";
    okBtn.style.background = "#0078d7";
    okBtn.style.color = "white";
    okBtn.style.border = "none";
    okBtn.style.borderRadius = "6px";
    okBtn.onclick = () => {
      modal.style.display = "none";
      okBtn.remove();
      onOK();
    };

    closeBtn.insertAdjacentElement("afterend", okBtn);

    modal.style.display = "flex";
  }

  // ------------------------------
  // 送信ボタン
  // ------------------------------
  document.getElementById("sendBtn").addEventListener("click", () => {

    const kumi = document.getElementById("groupNum").value.trim();

    if (!kumi || isNaN(kumi) || kumi < 1 || kumi > 18) {
      alert("組番号は 1〜18 の半角数字で入力してください");
      return;
    }

    // 現在の入力内容
    let anpi  = document.getElementById("anpi").value;
    let clean = document.getElementById("clean").value;

    // 差分判定
    const changed =
      (anpi  !== loadedAnpi) ||
      (clean !== loadedClean);

    // 元データが空でなければ確認
    const hasLoadedData =
      (loadedAnpi !== "") ||
      (loadedClean !== "");

    if (hasLoadedData && changed) {
      showOverwriteDialog(() => sendData(kumi, anpi, clean));
      return;
    }

    sendData(kumi, anpi, clean);
  });

  // ------------------------------
  // 実際の送信処理
  // ------------------------------
  function sendData(kumi, anpi, clean) {

    showSendingDialog();

    // 自動改行
    anpi  = wrapText(anpi);
    clean = wrapText(clean);

    const url =
      `${GAS_URL}?kumi=${encodeURIComponent(kumi)}` +
      `&anpi=${encodeURIComponent(anpi)}` +
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
  }

});
