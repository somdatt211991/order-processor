// Create a dummy list of SAML tokens along with their user names and expiration dates. This is just for demonstration purposes.

interface SamlToken {
    userName: string;
    token: string;
    expirationDate: Date;
}

const samlTokens: SamlToken[] = [
    {
        userName: 'john.doe',
        token: 'saml-token-12345',
        expirationDate: new Date('2024-12-31T23:59:59Z')
    },
    {
        userName: 'jane.smith',
        token: 'saml-token-67890',
        expirationDate: new Date('2024-11-30T23:59:59Z')
    },
    {
        userName: 'alice.jones',
        token: 'saml-token-abcde',
        expirationDate: new Date('2024-10-31T23:59:59Z')
    }
];

export default samlTokens;