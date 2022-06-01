import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TenantAuthInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const uuid = request.headers['uuid'];
    if (!uuid) {
      return this.responseError(context);
    }

    request.session = await this.prisma.tenant.findFirst({
      where: {
        accessUuid: uuid
      }
    });

    if (!request.session) {
      return this.responseError(context);
    }

    return next
      .handle();
  }

  private responseError(context: ExecutionContext): Observable<any> {
    context.switchToHttp()
      .getResponse()
      .status(401);
    return of({
      message: 'Unauthorized'
    });
  }
}