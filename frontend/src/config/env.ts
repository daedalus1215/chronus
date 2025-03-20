import Joi from "joi";

// Define the schema for environment variables
const envSchema = Joi.object({
  VITE_COGNITO_USER_POOL_ID: Joi.string().required(),
  VITE_COGNITO_CLIENT_ID: Joi.string().required(),
  VITE_COGNITO_REGION: Joi.string().required(),
  VITE_COGNITO_DOMAIN: Joi.string().uri().required(),
  VITE_COGNITO_REDIRECT_URI: Joi.string().uri().required(),
  VITE_RESPONSE_TYPE: Joi.string().required(),
  VITE_SCOPE: Joi.string().required(),
});

// Validate the process.env variables
const { error, value: envVars } = envSchema.validate(import.meta.env, {
  allowUnknown: true,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export the validated variables
export const env = {
  cognitoUserPoolId: envVars.VITE_COGNITO_USER_POOL_ID,
  cognitoClientId: envVars.VITE_COGNITO_CLIENT_ID,
  cognitoRegion: envVars.VITE_COGNITO_REGION,
  cognitoDomain: envVars.VITE_COGNITO_DOMAIN,
  cognitoRedirectUri: envVars.VITE_COGNITO_REDIRECT_URI,
  responseType: envVars.VITE_RESPONSE_TYPE,
  scope: envVars.VITE_SCOPE,
};
