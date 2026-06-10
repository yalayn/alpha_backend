import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { PlanAlreadyExistsException } from '@domain/exceptions/plan-already-exists.exception';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';
import { SubscriptionAlreadyActiveException } from '@domain/exceptions/subscription-already-active.exception';
import { SubscriptionAlreadyCanceledException } from '@domain/exceptions/subscription-already-canceled.exception';
import { PaymentFailedException } from '@domain/exceptions/payment-failed.exception';
import { FeatureNotIncludedException } from '@domain/exceptions/feature-not-included.exception';
import { UserAlreadyExistsException } from '@domain/exceptions/user-already-exists.exception';
import { InvalidCredentialsException } from '@domain/exceptions/invalid-credentials.exception';
import { SubscriptionNotActiveException } from '@domain/exceptions/subscription-not-active.exception';
import { SamePlanChangeException } from '@domain/exceptions/same-plan-change.exception';
import { PlanHasActiveSubscriptionsException } from '@domain/exceptions/plan-has-active-subscriptions.exception';
import { PlanIntervalLockedException } from '@domain/exceptions/plan-interval-locked.exception';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'internal_error';
    let message = exception.message;

    // 1. Manejo ultra-robusto para cualquier excepción de NestJS/HTTP
    const exceptionStatus = typeof exception.getStatus === 'function' ? exception.getStatus() : exception.status;
    
    if (exceptionStatus) {
      status = exceptionStatus;
      const responseBody = exception.response;
      code = responseBody?.error || (status === 404 ? 'not_found' : 'http_error');
      message = responseBody?.message || exception.message;
    }
    // 2. Mapeo de excepciones de dominio (si no tienen status previo)
    else if (exception instanceof PlanNotFoundException || exception instanceof SubscriptionNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      code = exception instanceof PlanNotFoundException ? 'plan_not_found' : 'subscription_not_found';
    } 
    else if (exception instanceof PlanAlreadyExistsException || exception instanceof UserAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      code = exception instanceof PlanAlreadyExistsException ? 'plan_already_exists' : 'user_already_exists';
    }
    else if (exception instanceof SubscriptionAlreadyActiveException) {
      status = HttpStatus.BAD_REQUEST;
      code = 'subscription_already_active';
    }
    else if (exception instanceof SubscriptionAlreadyCanceledException) {
      status = HttpStatus.BAD_REQUEST;
      code = 'subscription_already_canceled';
    }
    else if (exception instanceof PaymentFailedException) {
      status = HttpStatus.PAYMENT_REQUIRED;
      code = 'payment_processing_failed';
    }
    else if (exception instanceof FeatureNotIncludedException) {
      status = HttpStatus.FORBIDDEN;
      code = 'feature_not_in_plan';
    }
    else if (exception instanceof InvalidCredentialsException) {
      status = HttpStatus.UNAUTHORIZED;
      code = 'invalid_credentials';
    }
    else if (exception instanceof SubscriptionNotActiveException) {
      status = HttpStatus.CONFLICT;
      code = 'subscription_not_active';
    }
    else if (exception instanceof SamePlanChangeException) {
      status = HttpStatus.CONFLICT;
      code = 'same_plan_change';
    }
    else if (exception instanceof PlanHasActiveSubscriptionsException) {
      status = HttpStatus.CONFLICT;
      code = 'plan_has_active_subscriptions';
    }
    else if (exception instanceof PlanIntervalLockedException) {
      status = HttpStatus.CONFLICT;
      code = 'plan_interval_locked';
    }

    response.status(status).json({
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
