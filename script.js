// ===== 서비스 워커 제거 =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}

// ===== 상태 초기화 =====
let uploadedFiles = [];
let extractedData = [];
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewGrid = document.getElementById('previewGrid');
const processBtn = document.getElementById('processBtn');
const addMoreBtn = document.getElementById('addMoreBtn');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('resultsSection');
const tableBody = document.getElementById('tableBody');
const totalAmount = document.getElementById('totalAmount');
const totalKorean = document.getElementById('totalKorean');
const downloadBtn = document.getElementById('downloadBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const resetBtn = document.getElementById('resetBtn');
const notification = document.getElementById('notification');
const sharedBanner = document.getElementById('sharedBanner');

function resetAppState() {
  uploadedFiles = [];
  extractedData = [];

  uploadArea.style.display = 'block';
  previewSection.classList.remove('active');
  previewGrid.innerHTML = '';
  processBtn.disabled = true;
  fileInput.value = '';

  resultsSection.classList.remove('active');
  tableBody.innerHTML = '';
  totalAmount.textContent = '0원';
  totalKorean.textContent = '';

  if (sharedBanner) sharedBanner.classList.remove('active');

  window.history.replaceState({}, document.title, window.location.pathname);
}

// ===== 페이지 로딩 시 초기화 =====
window.addEventListener('DOMContentLoaded', () => {
  resetAppState();
});

// ===== 업로드 & 미리보기 =====
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => handleFiles(e.target.files));
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });

function handleFiles(files) {
  const validFiles = Array.from(files).filter(f => ['image/jpeg','image/jpg','image/png'].includes(f.type));
  if (!validFiles.length) { showNotification('JPG 또는 PNG 파일만 업로드 가능합니다'); return; }
  uploadedFiles.push(...validFiles);
  displayPreviews();
}

function displayPreviews() {
  if (!uploadedFiles.length) { previewSection.classList.remove('active'); processBtn.disabled = true; return; }
  previewSection.classList.add('active');
  previewGrid.innerHTML = '';
  uploadedFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <button class="preview-remove" onclick="removeFile(${idx})">&times;</button>
        <img src="${e.target.result}" alt="${file.name}" class="preview-image">
        <div class="preview-name">${file.name}</div>`;
      previewGrid.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
  processBtn.disabled = false;
}

function removeFile(idx) {
  uploadedFiles.splice(idx,1);
  displayPreviews();
}

addMoreBtn.addEventListener('click', () => fileInput.click());

// ===== OCR 처리 시뮬레이션 =====
const sampleData = [
  { number: 1, name: "홍길동", amount: "100,000", notes: "" },
  { number: 2, name: "김철수", amount: "200,000", notes: "" }
];

processBtn.addEventListener('click', () => {
  loading.classList.add('active');
  uploadArea.style.display = 'none';
  previewSection.style.display = 'none';

  setTimeout(() => {
    extractedData = sampleData;
    loading.classList.remove('active');
    displayResults();
  }, 1500);
});

function displayResults() {
  resultsSection.classList.add('active');
  tableBody.innerHTML = '';
  let total = 0;
  extractedData.forEach(row => {
    const amountNum = parseInt(row.amount.replace(/,/g, ''));
    total += amountNum;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="number-cell">${row.number}</td>
      <td>${row.name}</td>
      <td class="amount-cell">${row.amount}원</td>
      <td>${row.notes}</td>`;
    tableBody.appendChild(tr);
  });
  totalAmount.textContent = formatAmount(total) + '원';
  totalKorean.textContent = convertToKorean(total);
}

function formatAmount(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function convertToKorean(amount) { 
  if(amount<10000) return amount+'원'; 
  const eok=Math.floor(amount/100000000), man=Math.floor((amount%100000000)/10000);
  let r=''; if(eok>0){ r+=eok+'억'; if(man>0) r+=' '+man+'만원'; else r+='원'; } 
  else if(man>0) r+=man+'만원'; 
  return r; 
}

// ===== CSV 다운로드 =====
downloadBtn.addEventListener('click', () => {
  const csv = generateCSV();
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const t=new Date(); link.download=`축의금_부조금_${t.getFullYear()}${String(t.getMonth()+1).padStart(2,'0')}${String(t.getDate()).padStart(2,'0')}.csv`;
  link.click();
  showNotification('CSV 파일이 다운로드되었습니다');
});
function generateCSV() {
  let csv='번호,성명,금액,비고\n';
  extractedData.forEach(r => { csv+=`${r.number},${r.name},${r.amount},${r.notes}\n`; });
  return csv;
}

// ===== 공유 링크 복사 =====
copyLinkBtn.addEventListener('click', async () => {
  try {
    const encoded = btoa(encodeURIComponent(JSON.stringify(extractedData)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    await navigator.clipboard.writeText(shareUrl);
    showNotification('링크가 복사되었습니다!', 'success');
  } catch {
    showNotification('링크 복사에 실패했습니다', 'error');
  }
});

// ===== 리셋 버튼 =====
resetBtn.addEventListener('click', resetAppState);

// ===== 알림 =====
function showNotification(msg,type='success') {
  notification.textContent=msg;
  notification.className=`notification active ${type}`;
  setTimeout(()=>notification.classList.remove('active'),3000);
}
