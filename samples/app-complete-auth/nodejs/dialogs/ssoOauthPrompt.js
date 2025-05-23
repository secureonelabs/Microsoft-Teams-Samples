const { OAuthPrompt } = require('botbuilder-dialogs');
const { StatusCodes, ActivityTypes } = require('botbuilder');

/**
 * Response body returned for a token exchange invoke activity.
 */
class TokenExchangeInvokeResponse {
    /**
     * Creates a new instance of the TokenExchangeInvokeResponse class.
     * @param {string} id - The ID of the token exchange request.
     * @param {string} connectionName - The connection name for the OAuth provider.
     * @param {string} failureDetail - Details of any failure that occurred during the token exchange.
     */
    constructor(id, connectionName, failureDetail) {
        this.id = id;
        this.connectionName = connectionName;
        this.failureDetail = failureDetail;
    }
}

/**
 * SsoOAuthPrompt class handles the SSO OAuth prompt process.
 */
class SsoOAuthPrompt extends OAuthPrompt {
    /**
     * Continues the dialog.
     * @param {Object} dialogContext - The dialog context for the current turn of conversation.
     */
    async continueDialog(dialogContext) {
        // If the token was successfully exchanged already, it should be cached in TurnState along with the TokenExchangeInvokeRequest
        const cachedTokenResponse = dialogContext.context.turnState.tokenResponse;

        if (cachedTokenResponse) {
            const tokenExchangeRequest = dialogContext.context.turnState.tokenExchangeInvokeRequest;
            if (!tokenExchangeRequest) {
                throw new Error('TokenResponse is present in TurnState, but TokenExchangeInvokeRequest is missing.');
            }

            // PromptRecognizerResult
            const result = {};

            // TokenExchangeInvokeResponse
            const exchangeResponse = new TokenExchangeInvokeResponse(tokenExchangeRequest.id, this.settings.connectionName, this.failureDetail);

            await dialogContext.context.sendActivity({
                type: ActivityTypes.InvokeResponse,
                value: {
                    status: StatusCodes.OK,
                    body: exchangeResponse
                }
            });

            result.succeeded = true;
            // TokenResponse
            result.value = {
                channelId: cachedTokenResponse.channelId,
                connectionName: this.settings.connectionName,
                token: cachedTokenResponse.token
            };

            return await dialogContext.endDialog(result.value);
        }

        return await super.continueDialog(dialogContext);
    }
}

exports.SsoOAuthPrompt = SsoOAuthPrompt;