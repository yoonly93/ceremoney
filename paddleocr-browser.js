import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js';

let cvReady = false;

export async function initPaddleOCR() {
  if (!cvReady) {
    await new Promise(resolve => {
      const check = () => {
        if (typeof cv !== 'undefined') { cvReady = true; resolve(); } 
        else setTimeout(check, 100);
      };
      check();
    });
  }

  const detBuffer = await fetch('./models/ppocr_det.onnx').then(r => r.arrayBuffer());
  const recBuffer = await fetch('./models/ppocr_rec.onnx').then(r => r.arrayBuffer());
  const dict = (await fetch('./models/ppocr_dict.txt').then(r => r.text())).split('\n').map(s => s.trim());

  // 간단한 OCR 서비스 객체
  const ocrService = {
    detModel: await ort.InferenceSession.create(detBuffer),
    recModel: await ort.InferenceSession.create(recBuffer),
    dict
  };

  return ocrService;
}

export async function recognizeImage(img, ocrService) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 여기서는 간단히 bbox 없이 텍스트만 Tesseract.js 수준으로 placeholder 처리
  // 실제 PaddleOCR inference 로직 구현 필요
  // 예시 반환: [[번호, 성명, 금액, 비고], ...]
  return [
    ['1','홍길동','100000','축의금'],
    ['2','김철수','50000','조의금']
  ];
}
