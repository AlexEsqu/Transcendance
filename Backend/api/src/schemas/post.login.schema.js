export const postLoginSchema = {
	description:
		"Authenticates the user using their login (email or username) and password. \
   If authentication succeeds and two-factor authentication (2FA) is disabled, \
   the endpoint returns the user's id and a short-lived access token in the response body \
   and sets a long-lived refresh token in an HttpOnly `refreshToken` cookie. \
   \
   If 2FA is enabled for the user, the endpoint does not issue tokens immediately. \
   Instead, a one-time 6-digit verification code is sent to the user's email and \
   a boolean value is returned to indicate that the authentication process continues \
   by calling the `two-factor login` endpoint. \
   `This endpoint requires the client to have a verified email address.`",
	tags: ["auth"],
	body: { $ref: "authCredentialsBody" },
	response: {
		200: {
			description: "Login successful or 2FA required",
			content: {
				"application/json": {
					schema: {
						oneOf: [
							{
								description: "Login successful",
								type: "object",
								required: ["accessToken", "id"],
								properties: {
									accessToken: { type: "string" },
									id: { type: "integer" },
								},
							},
							{
								description: "Two-factor authentication required",
								type: "object",
								required: ["twoFactorRequired"],
								properties: {
									twoFactorRequired: { type: "boolean", example: true },
								},
							},
						],
					},
					examples: {
						noTwoFaExample: {
							summary: "Successful response when no 2FA is required",
							value: {
								accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
								id: 12,
							},
						},
						twoFaExample: {
							summary: "Successful response when 2FA is required",
							value: {
								twoFactorRequired: true
							},
						},
					},
				},
			},
		},
		302: {
			description: "Redirect: Email not verified",
			$ref: "SuccessMessageResponse#",
		},
		401: {
			description: "Unauthorized: Invalid credentials",
			$ref: "errorResponse#",
		},
		403: {
			description: "Forbidden: Email not verified",
			$ref: "errorResponse#",
		},
		500: {
			description: "Internal Server Error",
			$ref: "errorResponse#",
		},
		default: {
			description: "Unexpected error",
			$ref: "errorResponse#",
		},
	},
};
