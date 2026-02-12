package com.example.sns.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.sns.exception.BusinessException;
import com.example.sns.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

/**
 * 예외 처리 보조 AOP — Controller 예외 로깅.
 *
 * Controller 예외 발생 시 상세 로깅 후 재throw.
 * 예외 판단·변환 금지, GlobalExceptionHandler가 처리 (RULE 3.5.6).
 * SLF4J 파라미터화 로깅, ERROR 레벨 사용 (RULE 1.4.3).
 * BusinessException(예상된 오류)은 스택 트레이스 생략, 그 외는 전체 로깅.
 */
@Slf4j
@Aspect
@Component
@Order(80)
public class ExceptionLoggingAspect {

    @Pointcut("execution(* com.example.sns.controller..*(..))")
    public void controllerPointcut() {
    }

    @Around("controllerPointcut()")
    public Object logException(ProceedingJoinPoint joinPoint) throws Throwable {
        try {
            return joinPoint.proceed();
        } catch (Throwable e) {
            if (e instanceof BusinessException be) {
                // Refresh Token 없음: 비로그인 시 예상 동작, DEBUG로 처리
                if (be.getErrorCode() == ErrorCode.UNAUTHORIZED
                        && "Refresh Token이 필요합니다.".equals(be.getMessage())) {
                    log.debug("Controller exception: {} - {}", joinPoint.getSignature().toShortString(), e.getMessage());
                } else {
                    log.error("Controller exception: {} - {}", joinPoint.getSignature().toShortString(), e.getMessage());
                }
            } else {
                log.error("Controller exception: {} - {}", joinPoint.getSignature().toShortString(), e.getMessage(), e);
            }
            throw e;
        }
    }
}
