import { ErrorCode } from './../enums/error';
import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';

@Catch()
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.switchToHttp();
    const request = ctx.getRequest();
    const info = gqlHost.getInfo();
    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        errorMessage: exception.getResponse(),
      };
    }
    return {
      statusCode: ErrorCode.SYSTEM_ERROR,
      errorMessage: `resolver: ${
        info ? info.fieldName : request ? request.url : null
      } method: ${
        info ? info.parentType : request ? request.method : null
      } message: ${
        exception.message ? exception.message : JSON.stringify(exception)
      }`,
    };
  }
}
