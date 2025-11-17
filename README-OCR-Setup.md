# 축의금/부조금 OCR 설치 가이드

## 필요한 라이브러리 설치

### 1. Python 패키지 설치
```bash
pip install paddlepaddle paddleocr
pip install pytesseract
pip install opencv-python
pip install pillow
pip install numpy
```

또는 한 번에:
```bash
pip install paddlepaddle paddleocr pytesseract opencv-python pillow numpy
```

### 2. Tesseract OCR 설치

#### Windows
1. [Tesseract OCR 다운로드](https://github.com/UB-Mannheim/tesseract/wiki)
2. `tesseract-ocr-w64-setup-5.x.x.exe` 설치
3. 설치 시 **Korean language pack** 체크 필수!
4. 설치 경로: `C:\Program Files\Tesseract-OCR`
5. 환경변수 등록:
   - 시스템 속성 → 고급 → 환경 변수
   - Path에 `C:\Program Files\Tesseract-OCR` 추가

#### macOS
```bash
brew install tesseract
brew install tesseract-lang  # 한국어 포함
```

#### Ubuntu/Linux
```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install tesseract-ocr-kor
```

### 3. Tesseract 한국어 데이터 수동 설치 (필요시)

1. [tessdata GitHub](https://github.com/tesseract-ocr/tessdata) 방문
2. `kor.traineddata` 다운로드
3. tessdata 폴더에 복사:
   - Windows: `C:\Program Files\Tesseract-OCR\tessdata`
   - macOS: `/opt/homebrew/share/tessdata`
   - Linux: `/usr/share/tesseract-ocr/5/tessdata`

## 사용 방법

### 기본 사용
```python
from gift_ledger_ocr import GiftLedgerOCR

# OCR 객체 생성
ocr = GiftLedgerOCR()

# 이미지 처리
results = ocr.process_image("wedding_gift_ledger.jpg", use_preprocessing=True)

# CSV로 저장
ocr.save_to_csv(results['ledger_data'], 'output.csv')
```

### 명령줄에서 실행
```bash
python gift_ledger_ocr.py
```

## 이미지 전처리 단계

스크립트는 다음 단계로 이미지를 최적화합니다:

1. **그레이스케일 변환**: 컬러 이미지를 흑백으로 변환
2. **노이즈 제거**: Gaussian Blur로 스캔 노이즈 제거
3. **대비 향상**: CLAHE로 텍스트와 배경 구분 강화
4. **이진화**: Otsu's method로 흑백 이미지 생성
5. **모폴로지 연산**: 작은 노이즈 제거

## OCR 엔진 비교

### PaddleOCR
- ✅ 한국어 손글씨 인식 우수
- ✅ 딥러닝 기반 높은 정확도
- ✅ 별도 전처리 불필요
- ✅ 경량 모델 (14.8MB)
- 📊 한국어 인식률: ~90%

### Tesseract OCR
- ✅ 오픈소스, 무료
- ✅ 다양한 언어 지원
- ⚠️ 전처리 필수
- ⚠️ 손글씨 인식 제한적
- 📊 한국어 인식률: ~70-80% (전처리 후)

## 결과물

실행 후 생성되는 파일:
- `gift_ledger_output.csv`: 추출된 장부 데이터 (UTF-8 BOM)

CSV 형식:
```csv
번호,성명,금액,비고
1,전기석,100,000,대 1인
2,도라석,100,000,대 1인
3,임정규,200,000,대 2인
```

## 문제 해결

### Tesseract를 찾을 수 없음
```python
# Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# macOS
pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'
```

### 한국어 인식 안 됨
```bash
# 설치된 언어 확인
tesseract --list-langs

# kor이 없으면 언어팩 설치 필요
```

### PaddleOCR 모델 다운로드 느림
- 첫 실행 시 모델 자동 다운로드 (약 10MB)
- 인터넷 연결 필요

## 성능 향상 팁

1. **고해상도 이미지 사용**: 최소 300 DPI
2. **조명 균일**: 그림자 없이 고른 조명
3. **각도 조정**: 카메라 정면에서 촬영
4. **초점**: 텍스트가 선명하게 보이도록
5. **배경**: 단순하고 대비가 높은 배경

## 참고 자료

- [PaddleOCR 공식 문서](https://github.com/PaddlePaddle/PaddleOCR)
- [Tesseract OCR Wiki](https://github.com/tesseract-ocr/tesseract/wiki)
- [OpenCV 이미지 전처리](https://docs.opencv.org/)