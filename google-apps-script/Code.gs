/**
 * 인스타그램 컨설팅 사전 질문지 — 접수 저장 + 메일 발송
 * ─────────────────────────────────────────────
 * 구글시트의 "확장 프로그램 > Apps Script"에 이 코드를 통째로 붙여넣고
 * "배포 > 새 배포 > 웹 앱 > 액세스 권한: 모든 사용자"로 배포하세요.
 * 처음 접수가 들어오면 "접수내역" 시트를 자동으로 만들어 줍니다.
 *
 * ▶ TOKEN 값은 앱(Vercel)의 APP_TOKEN 과 똑같아야 합니다.
 */
var TOKEN = 'haeoragi-insta-2026';

// 신청서를 받을 메일 주소
var MAIL_TO = 'lajisuk@nate.com';

var SHEET_NAME = '접수내역';

function doGet(e) {
  return handle_(e.parameter, null);
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {}
  return handle_(e.parameter, body);
}

function handle_(params, body) {
  var data = body || params || {};
  var token = data.token || (params && params.token);
  if (token !== TOKEN) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  var action = data.action || (params && params.action);
  try {
    if (action === 'submit') {
      ensureSheet_();
      save_(data);
      var mailed = sendMail_(data);
      return json_({ ok: true, mailed: mailed });
    }
    if (action === 'ping') {
      return json_({ ok: true, pong: true });
    }
    return json_({ ok: false, error: 'unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function ensureSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(SHEET_NAME)) {
    var s = ss.insertSheet(SHEET_NAME);
    s.appendRow([
      '접수일시',
      '작성자',
      '연락처',
      '직위',
      '어린이집',
      '주소',
      '메일주소',
      '1.운영하려는 이유',
      '2.담고 싶은 내용',
      '3.우리 원 자랑',
    ]);
    s.setFrozenRows(1);
    s.setColumnWidth(1, 140);
    s.setColumnWidth(5, 160);
    s.setColumnWidth(6, 220);
    s.setColumnWidth(8, 320);
    s.setColumnWidth(9, 320);
    s.setColumnWidth(10, 320);
  }
}

function save_(d) {
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var row = s.getLastRow() + 1;
  var values = [
    nowStr_(),
    str_(d.name),
    str_(d.phone),
    str_(d.position),
    str_(d.center),
    str_(d.address),
    str_(d.email),
    str_(d.q1),
    str_(d.q2),
    str_(d.q3),
  ];
  s.getRange(row, 1, 1, values.length).setValues([values]);
  // 연락처가 숫자로 바뀌지 않도록 텍스트 고정
  s.getRange(row, 3).setNumberFormat('@').setValue(values[2]);
}

function sendMail_(d) {
  var subject =
    '[인스타 컨설팅 신청] ' + str_(d.center) + ' / ' + str_(d.name);

  var lines = [
    '영유아교육디자인연구소 인스타그램 컨설팅 사전 질문지가 접수되었습니다.',
    '',
    '■ 접수일시 : ' + nowStr_(),
    '',
    '■ 신청자 정보',
    '  - 이름 : ' + str_(d.name),
    '  - 연락처 : ' + str_(d.phone),
    '  - 직위 : ' + str_(d.position),
    '  - 어린이집 : ' + str_(d.center),
    '  - 주소 : ' + str_(d.address),
    '  - 메일주소 : ' + str_(d.email),
    '',
    '─────────────────────────────',
    '1. 어린이집 인스타그램 운영을 하고자 하는 이유',
    '─────────────────────────────',
    str_(d.q1),
    '',
    '─────────────────────────────',
    '2. 인스타그램에 담고 싶은 내용',
    '─────────────────────────────',
    str_(d.q2),
    '',
    '─────────────────────────────',
    '3. 우리 원의 특징 자랑',
    '─────────────────────────────',
    str_(d.q3),
    '',
  ];

  try {
    MailApp.sendEmail({
      to: MAIL_TO,
      subject: subject,
      body: lines.join('\n'),
      name: '인스타 컨설팅 신청서',
    });
    return true;
  } catch (err) {
    // 메일이 실패해도 시트에는 이미 저장되어 있으므로 접수는 성공 처리
    return false;
  }
}

function str_(v) {
  return String(v == null ? '' : v).trim();
}

function nowStr_() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
