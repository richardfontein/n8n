import {
    IExecuteFunctions,
} from 'n8n-core';

import {
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import {
    OptionsWithUri,
} from 'request';

import { getAccessToken } from './getAccessToken';

export class Whispir implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Whispir',
        name: 'whispir',
        icon: 'file:whispir.png',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Consume Whispir API',
        defaults: {
            name: 'Whispir',
            color: '#1A82e2',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'whispirApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Contact',
                        value: 'contact',
                    },
                    {
                        name: 'Distribution List',
                        value: 'distributionList',
                    },
                    {
                        name: 'Message',
                        value: 'message',
                    },
                ],
                default: 'contact',
                required: true,
                description: 'Resource to consume',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: [
                            'contact',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Get',
                        value: 'get',
                        description: 'Get a contact',
                    },
                ],
                default: 'get',
                description: 'The operation to perform.',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: [
                            'distributionList',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Get',
                        value: 'get',
                        description: 'Get a distribution list',
                    },
                ],
                default: 'get',
                description: 'The operation to perform.',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: [
                            'message',
                        ],
                    },
                },
                options: [
                    {
                        name: 'Send',
                        value: 'post',
                        description: 'Send a message',
                    },
                ],
                default: 'post',
                description: 'The operation to perform.',
            },
            {
                displayName: 'Workspace ID',
                name: 'workspaceId',
                type: 'string',
                required: false,
                default: '',
                description: 'ID for the workspace',
            },
            {
                displayName: 'ID',
                name: 'id',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'get',
                        ],
                        resource: [
                            'contact',
                            'distributionList',
                        ],
                    },
                },
                default: '',
                description: 'ID for the resource',
            },
            {
                displayName: 'To',
                name: 'to',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'post',
                        ],
                        resource: [
                            'message',
                        ],
                    },
                },
                default: '',
                description: 'Recipient of the message',
            },
            {
                displayName: 'Subject',
                name: 'subject',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'post',
                        ],
                        resource: [
                            'message',
                        ],
                    },
                },
                default: '',
                description: 'Subject of the message',
            },
            {
                displayName: 'Body',
                name: 'body',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: [
                            'post',
                        ],
                        resource: [
                            'message',
                        ],
                    },
                },
                default: '',
                description: 'Body of the message',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: IDataObject[] = [];
        const length = (items.length as unknown) as number;
        const qs: IDataObject = {};
        let responseData;
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        //Get credentials the user provided for this node
        const credentials = this.getCredentials('whispirApi') as IDataObject;

        const authToken = await getAccessToken({
            username: credentials.username as string,
            password: credentials.password as string,
            url: 'https://beta-server.au.whispir.com/sparx-graphql-api'
        });

        // get workspaceId input
        const workspaceId = this.getNodeParameter('workspaceId', 0) as string;
        const workspaceIdUri = `${workspaceId !== undefined ? `workspaces/${workspaceId}/` : ''}`

        for (let i = 0; i < length; i++) {

            if (resource === 'contact') {
                if (operation === 'get') {

                    // get contactId input
                    const contactId = this.getNodeParameter('id', i) as string;

                    //Make http request according to <https://sendgrid.com/docs/api-reference/>
                    const options: OptionsWithUri = {
                        headers: {
                            'Accept': 'application/vnd.whispir.contact-v1+json',
                            'x-api-key': `${credentials.apiKey}`,
                            'Authorization': `Bearer ${authToken}`,
                        },
                        method: 'GET',
                        uri: `https://api.au.whispir.com/${workspaceIdUri}contacts/${contactId}`,
                        json: true,
                    };

                    responseData = await this.helpers.request(options);
                }
            } else if (resource === 'distributionList') {
                if (operation === 'get') {

                    // get distributionId input
                    const distributionListId = this.getNodeParameter('id', i) as string;

                    //Make http request according to <https://sendgrid.com/docs/api-reference/>
                    const options: OptionsWithUri = {
                        headers: {
                            'Accept': 'application/vnd.whispir.distributionlist-v1+json',
                            'x-api-key': `${credentials.apiKey}`,
                            'Authorization': `Bearer ${authToken}`,
                        },
                        method: 'GET',
                        uri: `https://api.au.whispir.com/${workspaceIdUri}distributionlists/${distributionListId}`,
                        json: true,
                    };

                    responseData = await this.helpers.request(options);
                }
            } else if (resource === 'message') {
                if (operation === 'post') {
                    const to = this.getNodeParameter('to', i) as string;
                    const subject = this.getNodeParameter('subject', i) as string;
                    const body = this.getNodeParameter('body', i) as string;

                    //Make http request according to <https://sendgrid.com/docs/api-reference/>
                    const options: OptionsWithUri = {
                        headers: {
                            'Accept': 'application/vnd.whispir.message-v1+json',
                            'Content-Type': 'application/vnd.whispir.message-v1+json',
                            'x-api-key': `${credentials.apiKey}`,
                            'Authorization': `Bearer ${authToken}`,
                        },
                        body: {
                            to,
                            body,
                            subject,
                        },
                        method: 'POST',
                        uri: `https://api.au.whispir.com/workspaces/${workspaceId}/messages`,
                        json: true,
                    };

                    responseData = await this.helpers.request(options);
                }
            }
            if (Array.isArray(responseData)) {
                returnData.push.apply(returnData, responseData as IDataObject[]);
            } else {
                returnData.push(responseData as IDataObject);
            }
        }

        // Map data to n8n data
        return [this.helpers.returnJsonArray(returnData)];
    }
}
