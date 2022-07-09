import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

/**
 * Get user agent of request
 */
export const UserAgentRequestDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const graphqlCtx = GqlExecutionContext.create(ctx).getContext();
    const request: Request = graphqlCtx.req as Request;
    return request.headers['user-agent'];
  },
);
