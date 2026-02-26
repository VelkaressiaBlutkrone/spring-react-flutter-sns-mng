# Python LLM 모듈 개발 규칙

> 참조: [PRD.md](../PRD.md), [TASK_PYTHON.md](../TASK_PYTHON.md)

---

## 요약: 보강 우선순위

| 우선순위   | 항목                                                         |
| ---------- | ------------------------------------------------------------ |
| **최우선** | vLLM 또는 TGI 고성능 inference 엔진을 프로덕션 기본 방향으로 |
| **2순위**  | 추론 타임아웃·warm-up·rate limiting 현실화                   |
| **3순위**  | 한국 서비스 시 PII 마스킹 필수 수준                          |
| **유지**   | OOM 방지, Lazy Loading 금지, startup 로딩, 429 처리 등       |

---

## 1. 아키텍처 규칙

| 규칙                 | 설명                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **FastAPI 사용**     | REST API는 FastAPI로 구현. 비동기 처리에 최적화됨                                         |
| **Uvicorn/Gunicorn** | transformers 사용 시 단일 워커. vLLM 사용 시 워커 수보다 GPU 수·tensor-parallel이 더 중요 |
| **RAG 미사용**       | 외부 지식 검색 없이 순수 LLM 추론만 수행                                                  |
| **Spring Boot 연동** | CORS 설정 필수. JSON 요청/응답 형식 준수                                                  |

### 1.1 추론 동시성 제어

**transformers pipeline** 사용 시: VRAM/RAM 점유가 높아 워커 증가 시 OOM 위험. Semaphore로 동시성 제한 필수.

**vLLM/TGI** 사용 시: PagedAttention + continuous batching으로 자체 처리. Semaphore는 안전장치 역할만 수행.

| 규칙               | 설명                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **단일 모델 로딩** | transformers 시 모델 한 번만 로딩. 워커 증가 대신 Semaphore 사용                                  |
| **동시 요청 제한** | `MAX_CONCURRENT_INFERENCE` 환경변수로 상한 설정. vLLM은 50~150 수준 가능, transformers는 2~5 수준 |
| **초과 시 응답**   | 제한 초과 시 **429 Too Many Requests** 반환                                                       |

---

## 2. API 규칙

### 2.1 엔드포인트

| 경로            | 메서드 | 필수                      |
| --------------- | ------ | ------------------------- |
| `/`             | GET    | 서버 상태                 |
| `/health`       | GET    | 헬스체크                  |
| `/infer`        | POST   | LLM 추론 (일괄)           |
| `/infer/stream` | POST   | LLM 추론 (스트리밍, 선택) |

### 2.2 요청/응답 스키마

**POST /infer 요청** (JSON):

```json
{
  "query": "string (필수, 1~4096자)",
  "max_length": 100,
  "temperature": 0.7,
  "top_p": 1.0,
  "num_return_sequences": 1
}
```

**응답** (JSON):

```json
{
  "generated_text": "string"
}
```

### 2.3 스트리밍 응답 (선택)

LLM 응답이 길어질 경우 사용자 경험(UX) 향상을 위해 스트리밍 지원을 권장합니다.

| 규칙                  | 설명                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| **vLLM OpenAI API**   | vLLM OpenAI-compatible API 사용 시 `/v1/chat/completions` SSE 기본 지원 |
| **StreamingResponse** | 직접 구현 시 FastAPI `StreamingResponse`로 토큰 단위 스트리밍           |
| **Spring Boot 연동**  | Server-Sent Events (SSE)로 전달하는 방식 고려                           |

---

## 3. 전처리 규칙

LLM에 전달하기 전 입력 텍스트 전처리 필수:

| 항목            | 규칙                                                                            |
| --------------- | ------------------------------------------------------------------------------- |
| **길이 제한**   | `LLM_INPUT_MAX_LENGTH` (기본 2048자) 초과 시 잘라내기                           |
| **공백 정규화** | 연속 공백을 하나로 통합                                                         |
| **PII 마스킹**  | 한국 서비스는 개인정보 보호법 준수 차원에서 **필수**. 이메일·전화번호 등 마스킹 |

---

## 4. 에러 핸들링 규칙

| 예외                         | HTTP | 처리                                                                       |
| ---------------------------- | ---- | -------------------------------------------------------------------------- |
| 동시 요청 초과               | 429  | `{"detail": "동시 추론 요청 한도 초과"}`                                   |
| TimeoutError (추론 타임아웃) | 503  | `{"detail": "LLM 추론 타임아웃 (N초)"}`. `INFERENCE_TIMEOUT_SEC` 필수 설정 |
| MemoryError (OOM)            | 503  | `{"detail": "LLM 추론 중 메모리 부족"}`                                    |
| RuntimeError                 | 503  | 에러 메시지 전달                                                           |
| OSError (모델 로딩 실패)     | 503  | `{"detail": "LLM 모델 로딩 실패"}`                                         |
| 기타 Exception               | 500  | `{"detail": "서버 내부 오류가 발생했습니다"}`                              |

**추론 타임아웃 필수**: `asyncio.wait_for()` 또는 vLLM `max_model_len`+timeout 조합으로 `INFERENCE_TIMEOUT_SEC`(기본 60~120초) 적용.

**Fallback**: `LLM_FALLBACK_RESPONSE` 설정 시 예외 발생해도 해당 문자열 반환 (200).

---

## 5. 설정 규칙

| 규칙                         | 설명                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| **Pydantic Settings**        | `config.py`에서 환경변수 관리                                                              |
| **환경변수**                 | `.env` 또는 `.env.example` 참고                                                            |
| **민감 정보**                | API 키 등은 환경변수로만 주입, 코드에 하드코딩 금지                                        |
| **MAX_CONCURRENT_INFERENCE** | 동시 추론 요청 수 상한. transformers 2~5, vLLM 50~150 수준 (모델·GPU에 따라 상이)          |
| **INFERENCE_TIMEOUT_SEC**    | 추론 타임아웃 (기본 60~120초). `asyncio.wait_for()` 또는 vLLM `max_model_len`+timeout 조합 |
| **Rate limiting**            | 동시성 외 초당/분당 요청 제한 시 slowapi 또는 FastAPI rate limit middleware 권장           |
| **TRANSFORMERS_CACHE**       | 모델 캐시 경로. Docker 볼륨 마운트로 영속화 권장                                           |

---

## 6. 로깅 규칙

| 규칙          | 설명                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| **요청 로깅** | `/infer` 호출 시 query(50자 제한) 로깅                                         |
| **응답 로깅** | 생성 텍스트 길이 로깅                                                          |
| **토큰 로깅** | `prompt_tokens`, `completion_tokens` 로깅 (과금·사용량 추적, OpenAI 포맷 권장) |
| **예외 로깅** | `logger.exception` 또는 `logger.error` 사용                                    |
| **레벨**      | 기본 INFO, 상세 디버깅 시 DEBUG                                                |

---

## 7. 테스트 규칙

| 규칙            | 설명                                      |
| --------------- | ----------------------------------------- |
| **pytest**      | `tests/` 디렉터리에 테스트 작성           |
| **Mock 모드**   | `LLM_FALLBACK_MOCK=1`로 torch 없이 테스트 |
| **conftest.py** | 공통 fixture (client, mock env) 정의      |
| **실행**        | `pytest tests/ -v`                        |

---

## 8. 배포 규칙

| 규칙          | 설명                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| **Docker**    | Dockerfile 제공 시 `python:3.11-slim` 기반                                   |
| **포트**      | 기본 8000, `PORT` 환경변수로 변경 가능                                       |
| **워커**      | transformers 시 단일 워커. vLLM 시 GPU 수·tensor-parallel이 워커 수보다 중요 |
| **장치 감지** | `torch.cuda.is_available()`로 GPU/CPU 자동 감지 후 모델 배치                 |

---

## 9. 모델 서빙 규칙

### 9.1 모델 로딩 전략

| 규칙                  | 설명                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| **Lazy Loading 금지** | 첫 요청 시 로딩하면 첫 사용자 응답이 지연됨. 사용 금지                   |
| **시작 시 로딩**      | `on_event('startup')` 또는 Lifespan에서 서버 시작 시 모델 로딩 완료 필수 |
| **모델 warm-up**      | startup 후 dummy 요청 1~3회로 CUDA 커널 컴파일·KV cache 초기화 유도 권장 |
| **모델 캐싱**         | `TRANSFORMERS_CACHE` 경로를 Docker 볼륨에 마운트하여 재다운로드 방지     |

### 9.2 실행 환경 감지

| 규칙                    | 설명                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| **GPU/CPU 자동 감지**   | `device = "cuda" if torch.cuda.is_available() else "cpu"` 로 배치 |
| **환경변수 오버라이드** | 필요 시 `CUDA_VISIBLE_DEVICES` 등으로 장치 지정 가능              |

### 9.3 서빙 방식 (2026 기준)

naive transformers는 동시 2~5개만 돼도 latency 폭등·GPU 활용률 20~30% 수준. **프로덕션은 vLLM 또는 TGI 강력 권장** (throughput 5~20배, GPU 활용률 70~90%).

| 상황                   | 권장 (2026 기준)                     | 비고                                    |
| ---------------------- | ------------------------------------ | --------------------------------------- |
| 프로토타입/로컬 테스트 | transformers pipeline                | 빠르게 확인용                           |
| 소규모 (~5명 동시)     | transformers + asyncio Semaphore     | 그래도 vLLM 권장                        |
| **진짜 프로덕션**      | **vLLM (OpenAI 호환 API) 또는 TGI**  | throughput·GPU 활용률 대폭 향상         |
| multi-GPU 환경         | vLLM tensor-parallel + FastAPI proxy | 또는 FastAPI proxy + vLLM 다중 인스턴스 |

**Continuous batching**: vLLM/TGI 핵심 경쟁력. 가능하면 continuous batching 지원 엔진 사용.

### 9.4 vLLM 전환 가이드 (권장 마이그레이션 경로)

| 항목                      | 설명                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **전환 이득**             | throughput 5~20배, GPU 활용률 70~90%, PagedAttention·continuous batching                    |
| **OpenAI-compatible API** | vLLM `/v1/chat/completions` 등 OpenAI 포맷 지원. SSE 기본 제공                              |
| **FastAPI proxy 패턴**    | FastAPI는 vLLM 서버를 upstream으로 두고 proxy 역할. 인증·로깅·rate limit은 FastAPI에서 처리 |
| **engine_args 튜닝**      | `max_num_seqs`, `max_model_len`, `tensor_parallel_size` 등 환경에 맞게 조정                 |

---

## 10. 금지 사항

- RAG, 벡터 DB 사용
- `query` 없이 `/infer` 호출 허용
- 4096자 초과 입력 허용
- 예외 무시 (try-except 후 빈 응답 반환)
- **Lazy Loading**: 첫 요청 시 모델 로딩 (서버 시작 시 로딩 필수)
- **워커 다중화로 동시성 확보**: 모델 중복 로딩 → OOM 위험 (Semaphore/Queue 사용)
