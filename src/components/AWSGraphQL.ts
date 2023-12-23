import { generateClient, Client } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import { CustomCredentialsProvider } from './AWSAuthorizer';


const customCredentialsProvider = new CustomCredentialsProvider();


export class GraphQLTool {
    client:Client | undefined;

    constructor() {
        // Configure amplify for our graphql endpoint
        Amplify.configure({
            API: {
              GraphQL: {
                endpoint: 'https://ktkmgz2dpbc45afiqi3sb6gfmm.appsync-api.us-east-2.amazonaws.com/graphql',
                region: 'us-east-2',
                defaultAuthMode: 'iam',
              }
            }
        },
        {
            // Authorization done with a custom provider
            Auth: {
                // Supply the custom credentials provider to Amplify
                credentialsProvider: customCredentialsProvider
            },
        });

        this.client = generateClient();
    }

    /**
    * @param  {string} name the name of the channel
    * @param  {Object} data the data to publish to the channel
    */
    async publish(name:string, data:Object) {
        return await this.client!.graphql({
            query: publishDoc, 
            variables: { name, data }
        });
    }

        /**
     * @param  {string} name the name of the channel
     * @param  {nextCallback} next callback function that will be called with subscription payload data
     * @param  {function} [error] optional function to handle errors
     * @returns {Observable} an observable subscription object
     */
    subscribe(name: string, next: Function, error?: Function) {
        const graphql = this.client!.graphql({
            query: subscribeDoc,
            variables: { name }
        }) as any; // amplify doesn't seem to have the types properly exported for this...
        
        return graphql.subscribe({
            next: (data: any) => {
                next(data.data.subscribe);
            },
            error: error || console.log,
        });
    }
}

export const subscribeDoc = /* GraphQL */ `
    subscription Subscribe($name: String!) {
        subscribe(name: $name) {
            data
            name
        }
    }
`

export const publishDoc = /* GraphQL */ `
    mutation Publish($data: AWSJSON!, $name: String!) {
        publish(data: $data, name: $name) {
            data
            name
        }
    }
`

