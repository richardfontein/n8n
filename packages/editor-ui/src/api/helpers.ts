import axios, { AxiosRequestConfig, Method } from 'axios';
import {
	IDataObject,
} from 'n8n-workflow';
import { ActionContext, Store } from 'vuex';

export class ResponseError extends Error {
	// The HTTP status code of response
	httpStatusCode?: number;

	// The error code in the resonse
	errorCode?: number;

	// The stack trace of the server
	serverStackTrace?: string;

	/**
	 * Creates an instance of ResponseError.
	 * @param {string} message The error message
	 * @param {number} [errorCode] The error code which can be used by frontend to identify the actual error
	 * @param {number} [httpStatusCode] The HTTP status code the response should have
	 * @param {string} [stack] The stack trace
	 * @memberof ResponseError
	 */
	constructor (message: string, errorCode?: number, httpStatusCode?: number, stack?: string) {
		super(message);
		this.name = 'ResponseError';

		if (errorCode) {
			this.errorCode = errorCode;
		}
		if (httpStatusCode) {
			this.httpStatusCode = httpStatusCode;
		}
		if (stack) {
			this.serverStackTrace = stack;
		}
	}
}

export default async function makeRestApiRequest(context: ActionContext<any, unknown> | Store<any>, method: Method, endpoint: string, data?: IDataObject): Promise<any> { // tslint:disable-line:no-any
    try {
        const options: AxiosRequestConfig = {
            method,
            url: endpoint,
            baseURL: context.getters.getRestUrl || ((context as ActionContext<any, unknown>).rootGetters.getRestUrl),
            headers: {
                sessionid: context.getters.sessionId || ((context as ActionContext<any, unknown>).rootGetters.sessionId),
            },
        };
        if (['PATCH', 'POST', 'PUT'].includes(method)) {
            options.data = data;
        } else {
            options.params = data;
        }

        const response = await axios.request(options);
        return response.data.data;
    } catch (error) {
        if (error.message === 'Network Error') {
            throw new ResponseError('API-Server can not be reached. It is probably down.');
        }

        const errorResponseData = error.response.data;
        if (errorResponseData !== undefined && errorResponseData.message !== undefined) {
            throw new ResponseError(errorResponseData.message, errorResponseData.code, error.response.status, errorResponseData.stack);
        }

        throw error;
    }
}