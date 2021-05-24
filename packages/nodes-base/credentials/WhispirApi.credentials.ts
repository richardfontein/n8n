import {
    ICredentialType,
    NodePropertyTypes,
} from 'n8n-workflow';

export class WhispirApi implements ICredentialType {
    name = 'whispirApi';
    displayName = 'Whispir API';
    documentationUrl = 'whispir';
    properties = [
        {
            displayName: 'Username',
            name: 'username',
            type: 'string' as NodePropertyTypes,
            default: '',
        },
        {
            displayName: 'Password',
            name: 'password',
            type: 'string' as NodePropertyTypes,
            default: '',
        },
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string' as NodePropertyTypes,
            default: '',
        },
    ];
}
