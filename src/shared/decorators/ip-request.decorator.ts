import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

/**
 * Get Ip address of request
 */
export const IpRequestDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | string[] => {
    const graphqlCtx = GqlExecutionContext.create(ctx).getContext();
    const request = graphqlCtx.req as Request;
    return (
      request.headers['x-forwarded-for'] || request.connection.remoteAddress
    );
  },
);
