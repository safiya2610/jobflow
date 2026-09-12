import axios, { AxiosError } from 'axios';
import { prisma, Execution, Job } from 'db';

const isRetryable = (error: any): boolean => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!status) return true; // Network error or timeout
    return [408, 429, 500, 502, 503, 504].includes(status);
  }
  return true; // Unknown error, assume retryable for safety
};

const getBackoffSeconds = (attempt: number): number => {
  if (attempt === 1) return 0;
  if (attempt === 2) return 2;
  if (attempt === 3) return 4;
  if (attempt === 4) return 8;
  return Math.min(Math.pow(2, attempt - 1), 30);
};

export const executeJob = async (execution: Execution & { job: Job }) => {
  const { job } = execution;
  const timeoutMs = job.timeoutSeconds * 1000;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  const startedAt = new Date();
  
  await prisma.systemLog.create({
    data: {
      level: 'INFO',
      service: 'worker',
      workerId: execution.workerId,
      event: 'execution.started',
      message: `Execution #${execution.id.substring(0,8)} attempt ${execution.attemptNumber} started`,
      context: `executionId:${execution.id}`
    }
  });

  await prisma.systemLog.create({
    data: {
      level: 'DEBUG',
      service: 'worker',
      workerId: execution.workerId,
      event: 'http.request',
      message: `Making HTTP ${job.method} request to ${job.endpoint}`,
      context: `executionId:${execution.id}`
    }
  });
  
  try {
    const response = await axios({
      method: job.method,
      url: job.endpoint,
      headers: job.headers ? (job.headers as any) : undefined,
      data: job.payload ? job.payload : undefined,
      timeout: timeoutMs,
      signal: abortController.signal,
    });

    clearTimeout(timeoutId);

    const responseData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    
    // Cap response data to 10KB to prevent DB bloat
    const cappedResponseData = responseData.length > 10000 ? responseData.substring(0, 10000) + '...[TRUNCATED]' : responseData;

    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'SUCCESS',
        httpStatus: response.status,
        responseData: cappedResponseData,
        completedAt: new Date(),
        startedAt,
      },
    });

    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        service: 'worker',
        workerId: execution.workerId,
        event: 'http.response',
        message: `Received response ${response.status} in ${new Date().getTime() - startedAt.getTime()}ms`,
        context: `executionId:${execution.id}`
      }
    });

    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        service: 'worker',
        workerId: execution.workerId,
        event: 'execution.completed',
        message: `Execution #${execution.id.substring(0,8)} completed successfully`,
        context: `executionId:${execution.id}`
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    
    const axiosError = error as AxiosError;
    const httpStatus = axiosError.response?.status || null;
    const errorDetails = axiosError.message || String(error);

    const retryable = isRetryable(error);
    const attempt = execution.attemptNumber;
    const limit = job.retryLimit;

    if (retryable && attempt <= limit) {
      const backoffSeconds = getBackoffSeconds(attempt + 1);
      const queuedAt = new Date(Date.now() + backoffSeconds * 1000);

      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'RETRYING',
          httpStatus,
          errorDetails,
          completedAt: new Date(),
          startedAt,
        },
      });

      await prisma.systemLog.create({
        data: {
          level: 'WARN',
          service: 'worker',
          workerId: execution.workerId,
          event: 'execution.retrying',
          message: `Execution #${execution.id.substring(0,8)} failed, retrying in ${backoffSeconds}s`,
          context: `executionId:${execution.id}`
        }
      });

      // Create a new execution for the retry
      await prisma.execution.create({
        data: {
          jobId: job.id,
          status: 'PENDING',
          attemptNumber: attempt + 1,
          queuedAt,
          idempotencyKey: execution.idempotencyKey,
        },
      });
    } else {
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          httpStatus,
          errorDetails,
          completedAt: new Date(),
          startedAt,
        },
      });

      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          service: 'worker',
          workerId: execution.workerId,
          event: 'execution.failed',
          message: `Execution #${execution.id.substring(0,8)} failed after ${attempt} attempts`,
          context: `executionId:${execution.id}`
        }
      });
    }
  }
};
