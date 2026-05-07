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

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'internal_error';
    let message = exception.message;

    // Mapeo de excepciones de dominio
    if (exception instanceof PlanNotFoundException || exception instanceof SubscriptionNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      code = exception instanceof PlanNotFoundException ? 'plan_not_found' : 'subscription_not_found';
    } 
    else if (exception instanceof PlanAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      code = 'plan_already_exists';
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
    // Manejo de errores de validación de NestJS (class-validator)
    else if (exception.status === HttpStatus.BAD_REQUEST && exception.response?.message) {
      status = HttpStatus.BAD_REQUEST;
      code = 'validation_error';
      message = Array.isArray(exception.response.message) 
        ? exception.response.message.join(', ') 
        : exception.response.message;
    }

    response.status(status).json({
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
