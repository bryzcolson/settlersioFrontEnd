import {
    CredentialsAndIdentityIdProvider,
    CredentialsAndIdentityId,
    GetCredentialsOptions,
  } from 'aws-amplify/auth';
  import { STS, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts';
  import { CognitoIdentity } from '@aws-sdk/client-cognito-identity';

export class CustomCredentialsProvider implements CredentialsAndIdentityIdProvider {

  credentials: CredentialsAndIdentityId | undefined;

  // This just gives us API access for cognito and STS
  cognitoIdentity: CognitoIdentity;
  sts: STS;

  currentlyUpdatingPromise: Promise<void> | null;

  constructor() {
    this.cognitoIdentity = new CognitoIdentity({
      region: 'us-east-2',
    });

    this.sts = new STS({
      region: 'us-east-2',
    });

    this.currentlyUpdatingPromise = this.updateCredentials();
    console.log(this.currentlyUpdatingPromise);
  }

  async updateCredentials() {
    try {
      const getIdResult = await this.cognitoIdentity.getId({
        // Get the identityPoolId from config
        IdentityPoolId: 'us-east-2:ac231e6a-bf18-4e16-b109-64feaae712cd',
      });

      // Get a valid WebIdentityToken
      const openIdTokenResult = await this.cognitoIdentity.getOpenIdToken({
        IdentityId: getIdResult.IdentityId,
      });

      // Assume an IAM role
      const assumeRoleResult = await this.sts.send(new AssumeRoleWithWebIdentityCommand({
          RoleArn: 'arn:aws:iam::387254482381:role/service-role/hexplorers_user',
          RoleSessionName: "hexplorers-user",
          WebIdentityToken: openIdTokenResult.Token
      }));

      const credentials: CredentialsAndIdentityId = {
      credentials: {
          accessKeyId: assumeRoleResult.Credentials?.AccessKeyId!,
          secretAccessKey: assumeRoleResult.Credentials?.SecretAccessKey!,
          sessionToken: assumeRoleResult.Credentials?.SessionToken,
          expiration: assumeRoleResult.Credentials?.Expiration,
          },
        identityId: getIdResult.IdentityId,
      };
      this.credentials = credentials;
    } catch (e) {
      this.credentials = undefined;
      console.log('Error getting credentials: ', e);
    }
  }
  
  async getCredentialsAndIdentityId(getCredentialsOptions: GetCredentialsOptions
  ): Promise<CredentialsAndIdentityId | undefined> {
    await this.currentlyUpdatingPromise; // Make sure no updates are currently in progress

    if (this.credentials == null || // No credentials yet
      this.credentials.credentials.expiration! < new Date()) { // Expired credentials

      this.currentlyUpdatingPromise = this.updateCredentials();
      await this.currentlyUpdatingPromise;
      return this.credentials;
    }

    // Still valid credentials, just return them
    return this.credentials;
  }
    // Implement this to clear any cached credentials and identityId. This can be called when signing out of the federation service.
    clearCredentialsAndIdentityId(): void {
      this.credentials = undefined;
      this.currentlyUpdatingPromise = null;
    }
  }