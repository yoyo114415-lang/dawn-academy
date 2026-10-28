/**
 * 《破曉學園》心靈圖卡免費郵件發送服務 (Google Apps Script Web App)
 * 
 * 核心特色：
 * 1. 100% 完全免費：使用 Google 官方個人帳號 (100 封/天) 或 Workspace/教育帳號 (1500 封/天)。
 * 2. 零亂碼保證：移除易造成郵件客戶端解碼錯誤之 4-byte Emoji，全面使用標準中文排版。
 * 3. 資料最小化 (Zero-Persistence)：寄完即焚，絕不儲存或保留玩家的 Email，完全保護隱私。
 * 4. 純圖片附件：附件為 PNG 圖檔，無可執行檔與木馬風險，符合 Gmail 最高安全規範。
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '未接收到有效請求內容。'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. 取得並解析前端傳來的 JSON 數據
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var recipient = (data.email || '').trim();
    var base64Image = data.imageBase64 || '';
    var evalTitle = (data.title || '陽光破曉：走出陰霾').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ''); // 過濾 Emoji
    var overallScore = data.score || 85;
    
    // 2. 嚴格驗證 Email 格式
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recipient || !emailRegex.test(recipient)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Email 格式不正確，請輸入正確的信箱地址。'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. 檢查圖檔數據
    if (!base64Image) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: '未接收到圖檔數據，請重新嘗試。'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 移除可能夾帶的 Data URL 前綴 (data:image/png;base64,)
    if (base64Image.indexOf('base64,') > -1) {
      base64Image = base64Image.split('base64,')[1];
    }
    
    // 4. 解碼 Base64 並生成 PNG 圖片附件
    var decodedBytes = Utilities.base64Decode(base64Image);
    var imageBlob = Utilities.newBlob(decodedBytes, 'image/png', '破曉學園_心靈成長成果圖卡.png');
    
    // 5. 撰寫信件主旨與乾淨優雅的 HTML 內文 (全面消除 Emoji 避免出現菱形問號亂碼)
    var subject = '【破曉學園】你的專屬心靈成長成果圖卡已送達！';
    var htmlBody = '' +
      '<!DOCTYPE html>' +
      '<html><head><meta charset="UTF-8"></head><body style="margin:0; padding:0; background:#f4eee2;">' +
      '<div style="font-family: \'Microsoft JhengHei\', \'PingFang TC\', Helvetica, Arial, sans-serif; max-width: 620px; margin: 20px auto; padding: 24px; background: #fdfaf3; border: 1.5px solid #ebdcc5; border-radius: 16px;">' +
        '<div style="text-align: center; margin-bottom: 20px;">' +
          '<div style="display: inline-block; padding: 4px 18px; background: #e5983c; color: #ffffff; border-radius: 16px; font-size: 13px; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px;">評估完成・心靈破曉</div>' +
          '<h2 style="color: #4a3319; margin: 0 0 6px 0; font-size: 24px; letter-spacing: 0.5px;">《破曉學園》心靈探索成果</h2>' +
          '<p style="color: #8c7355; font-size: 14px; margin: 0;">走出陰霾，迎接晨曦破曉的新生旅程</p>' +
        '</div>' +
        '<div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #ebdcc5; line-height: 1.85; color: #2c251e; font-size: 15px;">' +
          '<p style="margin-top:0;">親愛的同學你好：</p>' +
          '<p>恭喜你順利完成了《破曉學園》的五天校園探索！你在面對挑戰與困境時展現了無比的勇氣與智慧。</p>' +
          '<p>你獲得了心靈榮譽稱號：<strong style="color: #c47614; font-size: 16px;">【' + evalTitle + '】</strong>（整體狀態指數：' + overallScore + ' 分）。</p>' +
          '<p>系統已為你生成專屬的<strong>「五維心靈成長圖卡」</strong>，並隨信以附件方式送達。歡迎下載保存，記錄屬於你的成長與轉變！</p>' +
          '<div style="margin: 20px 0; padding: 14px 18px; background: #fff9ee; border-left: 4px solid #d49b2d; border-radius: 6px; font-size: 14px; color: #5a3d0b; line-height: 1.7;">' +
            '<strong>【心靈給力站・小叮嚀】</strong><br>' +
            '在人生的旅途中，無論遇到多大的風雨，請記得你永遠不是孤單一人，身邊總有溫暖的師長與朋友願意接住你。' +
          '</div>' +
          '<hr style="border: none; border-top: 1px dashed #ebdcc5; margin: 20px 0;">' +
          '<div style="font-size: 13px; color: #7f684e; line-height: 1.75;">' +
            '<strong>【溫暖陪伴與求助資源】</strong><br>' +
            '・教育部防制校園霸凌專線：1953（24 小時免付費）<br>' +
            '・衛福部安心專線：1925（依舊愛我）<br>' +
            '・兒童福利聯盟諮詢專線：0800-003-123' +
          '</div>' +
        '</div>' +
        '<div style="text-align: center; margin-top: 18px; font-size: 12px; color: #a8947f; line-height: 1.6;">' +
          '本郵件由《破曉學園》畢業專題系統自動發送，請勿直接回覆。<br>' +
          '隱私承諾：系統寄完即焚，絕不保留或儲存你的 Email 信箱。' +
        '</div>' +
      '</div>' +
      '</body></html>';
      
    // 6. 調用 Google 官方 GmailApp 服務安全發送郵件 (純文字信件預設同樣消除特殊 Emoji)
    GmailApp.sendEmail(recipient, subject, '恭喜完成《破曉學園》探索！請在支援 HTML 的郵件軟體中查看你的心靈成長圖卡，附件已附上專屬圖檔。', {
      htmlBody: htmlBody,
      attachments: [imageBlob],
      name: '《破曉學園》心靈探索團隊'
    });
    
    // 7. 回傳成功狀態 (支援 CORS text 輸出)
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '成果圖卡已成功寄送至你的 Gmail！請前往信箱查收（若未收到可至垃圾郵件匣查看）。'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: '發送失敗：' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 支援 GET 請求用於測試服務是否正常運作
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: '《破曉學園》郵件服務運作正常。'
  })).setMimeType(ContentService.MimeType.JSON);
}
