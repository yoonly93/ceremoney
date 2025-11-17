// import 제거, 브라우저 전역 ort 사용
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

  // ONNX 세션 생성
  const detSession = await ort.InferenceSession.create(detBuffer);
  const recSession = await ort.InferenceSession.create(recBuffer);

  return { detSession, recSession, dict };
}

// 임시 recognizeImage 함수 (실제 OCR inference 필요)
export async function recognizeImage(img, ocrService) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 실제 PaddleOCR inference 구현 전 placeholder 반환
  return [
    ['1','홍길동','100000','축의금'],
    ['2','김철수','50000','조의금']
  ];
}
