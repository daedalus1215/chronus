import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { TextToSpeechResponseDto } from 'src/audio/apps/dtos/requests/text-to-speech.dto';

export const TextToSpeechSwagger: ProtectedActionOptions = {
  tag: 'Audio',
  summary: 'Convert text to speech',
  additionalResponses: [
    {
      status: 200,
      description: 'The text has been successfully converted to speech.',
      type: TextToSpeechResponseDto,
    },
    {
      status: 400,
      description: 'Bad request - Invalid input parameters.',
    },
    {
      status: 500,
      description: 'Internal server error - Failed to convert text to speech.',
    },
  ],
};
