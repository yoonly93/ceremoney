#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
축의금/부조금 장부 OCR 스크립트
PaddleOCR + Tesseract + 이미지 전처리
"""

import cv2
import numpy as np
from paddleocr import PaddleOCR
import pytesseract
from PIL import Image
import re
import csv

class GiftLedgerOCR:
    def __init__(self):
        # PaddleOCR 초기화 (한국어)
        self.paddle_ocr = PaddleOCR(use_angle_cls=True, lang='korean')
        
    def preprocess_image(self, image_path):
        """이미지 전처리: OCR 정확도 향상"""
        # 이미지 읽기
        img = cv2.imread(image_path)
        
        # 1. 그레이스케일 변환
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. 노이즈 제거 (Gaussian Blur)
        denoised = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # 3. 대비 향상 (CLAHE - Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)
        
        # 4. 이진화 (Otsu's Binarization)
        _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # 5. 모폴로지 연산 (작은 노이즈 제거)
        kernel = np.ones((1,1), np.uint8)
        cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        return cleaned
    
    def extract_text_paddleocr(self, image_path):
        """PaddleOCR로 텍스트 추출"""
        result = self.paddle_ocr.ocr(image_path, cls=True)
        
        extracted_data = []
        for idx in range(len(result)):
            for line in result[idx]:
                bbox, (text, confidence) = line
                extracted_data.append({
                    'text': text,
                    'confidence': confidence,
                    'bbox': bbox
                })
        
        return extracted_data
    
    def extract_text_tesseract(self, preprocessed_img):
        """Tesseract로 텍스트 추출 (전처리된 이미지 사용)"""
        # Tesseract 설정 (한국어 + 영어)
        custom_config = r'--oem 3 --psm 6 -l kor+eng'
        text = pytesseract.image_to_string(preprocessed_img, config=custom_config)
        
        return text
    
    def parse_ledger_data(self, ocr_results):
        """OCR 결과를 장부 데이터로 파싱"""
        ledger_entries = []
        
        for item in ocr_results:
            text = item['text']
            
            # 금액 패턴 매칭 (예: 100,000 또는 100,)
            amount_pattern = r'(\d{1,3}(?:,\d{3})*,?)\s*(?:-|원)?'
            amount_match = re.search(amount_pattern, text)
            
            # 비고 패턴 (大1, 小1 등)
            note_pattern = r'(大|小|소)\s*(\d+)'
            note_match = re.findall(note_pattern, text)
            
            # 이름 추출 (한글 2-4자)
            name_pattern = r'[가-힣]{2,4}'
            name_match = re.search(name_pattern, text)
            
            if amount_match or name_match:
                entry = {
                    'name': name_match.group() if name_match else '',
                    'amount': amount_match.group(1) if amount_match else '',
                    'notes': self._format_notes(note_match),
                    'confidence': item['confidence']
                }
                ledger_entries.append(entry)
        
        return ledger_entries
    
    def _format_notes(self, note_matches):
        """비고란 포맷팅 (大1 -> 대 1인)"""
        if not note_matches:
            return ''
        
        notes = []
        for note_type, count in note_matches:
            if note_type == '大':
                notes.append(f'대 {count}인')
            elif note_type in ['소', '小']:
                notes.append(f'소 {count}인')
        
        return ', '.join(notes)
    
    def process_image(self, image_path, use_preprocessing=True):
        """이미지 처리 및 OCR 실행"""
        print(f"처리 중: {image_path}")
        
        # 1. PaddleOCR 실행
        print("1. PaddleOCR 실행 중...")
        paddle_results = self.extract_text_paddleocr(image_path)
        
        tesseract_text = None
        # 2. 이미지 전처리 및 Tesseract
        if use_preprocessing:
            print("2. 이미지 전처리 중...")
            preprocessed = self.preprocess_image(image_path)
            
            # 3. Tesseract 실행 (전처리된 이미지)
            print("3. Tesseract OCR 실행 중...")
            tesseract_text = self.extract_text_tesseract(preprocessed)
        
        # 4. 결과 파싱
        print("4. 데이터 파싱 중...")
        ledger_data = self.parse_ledger_data(paddle_results)
        
        return {
            'paddle_results': paddle_results,
            'tesseract_text': tesseract_text,
            'ledger_data': ledger_data
        }
    
    def save_to_csv(self, ledger_data, output_path='output.csv'):
        """결과를 CSV로 저장"""
        with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=['번호', '성명', '금액', '비고'])
            writer.writeheader()
            
            for idx, entry in enumerate(ledger_data, 1):
                writer.writerow({
                    '번호': idx,
                    '성명': entry['name'],
                    '금액': entry['amount'],
                    '비고': entry['notes']
                })
        
        print(f"✅ CSV 저장 완료: {output_path}")


# 사용 예제
if __name__ == "__main__":
    # OCR 객체 생성
    ocr = GiftLedgerOCR()
    
    # 이미지 처리
    image_path = "wedding_gift_ledger.jpg"  # 여기에 실제 이미지 경로 입력
    results = ocr.process_image(image_path, use_preprocessing=True)
    
    # 결과 출력
    print("\n=== OCR 결과 ===")
    for entry in results['ledger_data']:
        print(f"이름: {entry['name']}, 금액: {entry['amount']}, 비고: {entry['notes']}")
    
    # CSV 저장
    ocr.save_to_csv(results['ledger_data'], 'gift_ledger_output.csv')
    
    print("\n처리 완료!")
