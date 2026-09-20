import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { HermesRemoteCaller } from '../hermes.remote-caller';
import { createMock } from 'src/shared-kernel/test-utils';

const BASE_URL = 'http://hermes:8081/api';

const makeResponse = (
  data: unknown,
  headers: Record<string, unknown> = {}
): AxiosResponse =>
  ({
    data,
    status: 200,
    statusText: 'OK',
    headers,
    config: {},
    request: {},
  }) as AxiosResponse;

const makeAxiosError = (status?: number, data?: unknown): AxiosError =>
  new AxiosError(
    status === undefined
      ? 'timeout of 30000ms exceeded'
      : `Request failed with status code ${status}`,
    status === undefined ? 'ECONNABORTED' : 'ERR_BAD_RESPONSE',
    undefined,
    undefined,
    status === undefined
      ? undefined
      : ({
          status,
          statusText: 'ERR',
          data,
          headers: {},
          config: {},
        } as AxiosResponse)
  );

const catchError = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the promise to reject');
};

describe('HermesRemoteCaller', () => {
  let target: HermesRemoteCaller;
  let mockHttpService: jest.Mocked<HttpService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const buildTarget = async (baseUrl: string | null = BASE_URL) => {
    mockHttpService = createMock<HttpService>({
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    });
    mockConfigService = createMock<ConfigService>({
      get: jest.fn(() => baseUrl),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HermesRemoteCaller,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    return module.get(HermesRemoteCaller);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    target = await buildTarget();
  });

  describe('constructor', () => {
    it('should throw when HERMES_API_URL is not configured', async () => {
      await expect(buildTarget(null)).rejects.toThrow(
        'HERMES_API_URL environment variable is not set'
      );
    });

    it('should normalize trailing slashes from the configured base URL', async () => {
      target = await buildTarget(`${BASE_URL}///`);
      const response = makeResponse({
        file_path: '/files/7/11.mp3',
        file_name: '7-11.mp3',
      });
      mockHttpService.post.mockReturnValue(of(response));

      await target.convertTextToSpeech({ assetId: 11, userId: 7, text: 'hi' });

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `${BASE_URL}/text-to-speech`,
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('convertTextToSpeech', () => {
    const makeRequest = (
      overrides: { text?: string; userId?: number; assetId?: number } = {}
    ) => ({
      assetId: 11,
      userId: 7,
      text: 'default text',
      ...overrides,
    });

    it('should POST sanitized text with stringified ids to the text-to-speech endpoint', async () => {
      const response = makeResponse({
        file_path: '/files/7/11.mp3',
        file_name: '7-11.mp3',
      });
      mockHttpService.post.mockReturnValue(of(response));

      const result = await target.convertTextToSpeech(
        makeRequest({
          text: 'Line one\n\nLine two\ttabbed   spaced "straight quotes" and \'apostrophes\' with $&*!symbols, end.',
        })
      );

      expect(mockHttpService.post).toHaveBeenCalledWith(
        `${BASE_URL}/text-to-speech`,
        {
          text: 'Line one Line two tabbed spaced straight quotes and apostrophes with !symbols, end.',
          userId: '7',
          assetId: '11',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toBe(response.data);
    });

    it('should remove curly quotes instead of normalizing them', async () => {
      const response = makeResponse({
        file_path: '/files/7/11.mp3',
        file_name: '7-11.mp3',
      });
      mockHttpService.post.mockReturnValue(of(response));

      await target.convertTextToSpeech(
        makeRequest({ text: '\u201Chello\u201D world' })
      );

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ text: 'hello world' }),
        expect.anything()
      );
    });

    it('should map a 404 response to a not-found HttpException', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => makeAxiosError(404))
      );

      const caught = await catchError(
        target.convertTextToSpeech(makeRequest())
      );

      expect(caught).toBeInstanceOf(HttpException);
      const httpError = caught as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(httpError.getResponse()).toBe(
        'Hermes API endpoint not found. Please check the HERMES_API_URL configuration.'
      );
    });

    it('should map a 500 response with a detail to an internal-server-error HttpException', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => makeAxiosError(500, { detail: 'upstream exploded' }))
      );

      const caught = await catchError(
        target.convertTextToSpeech(makeRequest())
      );

      expect(caught).toBeInstanceOf(HttpException);
      const httpError = caught as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(httpError.getResponse()).toBe(
        'Internal Server Error in Hermes API: upstream exploded'
      );
    });

    it('should map a 500 response without a detail to an unknown-error HttpException', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => makeAxiosError(500))
      );

      const caught = await catchError(
        target.convertTextToSpeech(makeRequest())
      );

      expect(caught).toBeInstanceOf(HttpException);
      const httpError = caught as HttpException;
      expect(httpError.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(httpError.getResponse()).toBe(
        'Internal Server Error in Hermes API: Unknown error'
      );
    });

    it('should rethrow non-mapped HTTP error statuses as-is', async () => {
      const error = makeAxiosError(502);
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(target.convertTextToSpeech(makeRequest())).rejects.toBe(
        error
      );
    });

    it('should rethrow network errors without a response as-is', async () => {
      const error = makeAxiosError(undefined);
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(target.convertTextToSpeech(makeRequest())).rejects.toBe(
        error
      );
    });

    it('should rethrow non-axios errors as-is', async () => {
      const error = new Error('boom');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(target.convertTextToSpeech(makeRequest())).rejects.toBe(
        error
      );
    });
  });

  describe('downloadAudio', () => {
    it('should GET the user/asset endpoint without params when no file name is given and normalize headers', async () => {
      const data = Buffer.from('id3audio-bytes');
      mockHttpService.get.mockReturnValue(
        of(
          makeResponse(data, {
            'content-type': 'audio/mpeg',
            'x-multi': ['a=1', 'b=2'],
            'x-count': 42,
            'x-none': null,
          })
        )
      );

      const result = await target.downloadAudio(7, '11');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${BASE_URL}/download/7/11`,
        {
          responseType: 'arraybuffer',
          params: undefined,
        }
      );
      expect(result.data).toBe(data);
      expect(result.headers).toEqual({
        'content-type': 'audio/mpeg',
        'x-multi': 'a=1, b=2',
      });
    });

    it('should pass the file name as the filename query param when given', async () => {
      const data = Buffer.from('id3audio-bytes');
      mockHttpService.get.mockReturnValue(of(makeResponse(data)));

      await target.downloadAudio(7, '11', 'my-file.mp3');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${BASE_URL}/download/7/11`,
        {
          responseType: 'arraybuffer',
          params: { filename: 'my-file.mp3' },
        }
      );
    });
  });

  describe('deleteAudioByPath', () => {
    it('should DELETE with the file path as the file_path query param', async () => {
      mockHttpService.delete.mockReturnValue(of(makeResponse(null)));

      await target.deleteAudioByPath('/files/7/11.mp3');

      expect(mockHttpService.delete).toHaveBeenCalledWith(
        `${BASE_URL}/delete-by-path`,
        {
          params: { file_path: '/files/7/11.mp3' },
        }
      );
    });

    it('should resolve silently when the file is already deleted (404)', async () => {
      mockHttpService.delete.mockReturnValue(
        throwError(() => makeAxiosError(404))
      );

      const result = await target.deleteAudioByPath('/files/7/11.mp3');

      expect(result).toBeUndefined();
    });

    it('should rethrow non-404 HTTP errors as-is', async () => {
      const error = makeAxiosError(500, { detail: 'disk on fire' });
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(target.deleteAudioByPath('/files/7/11.mp3')).rejects.toBe(
        error
      );
    });
  });

  describe('downloadAudioByPath', () => {
    it('should GET the download-by-path endpoint with the file path and return raw data', async () => {
      const data = Buffer.from('id3audio-bytes');
      mockHttpService.get.mockReturnValue(
        of(makeResponse(data, { 'content-type': 'audio/mpeg' }))
      );

      const result = await target.downloadAudioByPath('/files/7/11.mp3');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `${BASE_URL}/download-by-path`,
        {
          responseType: 'arraybuffer',
          params: { file_path: '/files/7/11.mp3' },
        }
      );
      expect(result.data).toBe(data);
      expect(result.headers).toEqual({ 'content-type': 'audio/mpeg' });
    });
  });
});
