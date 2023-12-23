import { GraphQLTool } from './AWSGraphQL';
import { IStateUpdate } from '../state/StateUpdate';
import { Game } from '../state/Game';
import { MenuManager } from './MenuManager';
import {  ConnectionState } from 'aws-amplify/api';
import { Hub } from 'aws-amplify/utils';

export class AppSync {

    userID: string;
    channel: string | null;
    subscription: any; // Actually observable. AWS types not working. this is a workaround
    game: Game | null;
    sentOutUpdates: Object[];
    menuManager: MenuManager;
    graphQLTool : GraphQLTool;

    constructor(menuManager: MenuManager) {
        this.userID = Math.random().toString(); // Not security critical. Just to identify duplicate request
        this.channel = null;
        this.game = null;
        this.subscription = null;
        this.sentOutUpdates = [];
        this.menuManager = menuManager;
        this.graphQLTool = new GraphQLTool();
    }

    subscribe(newChannel: string, onConnectionSuccess: Function) {
        this.channel = newChannel;

        Hub.listen('api', (data: any) => {
            const { payload } = data;
            if (payload.event === "ConnectionStateChange") {
              const connectionState = payload.data.connectionState as ConnectionState;
              console.log("Appsync subscription status update: ", connectionState);
              if (connectionState === ConnectionState.Connected) {
                onConnectionSuccess();
              }
            }
        });

        console.log("HELLO TRYING TO SUB");
        this.graphQLTool.subscribe(this.channel, (rawData:any) => {
            const data = JSON.parse(rawData.data);
            console.log("Subscription data received: " , data);
            const dataUserID = data.userID;
            if (dataUserID == this.userID) {
                return; // Ignore data sent by this own user...
            }

            if (data.update == undefined) {
                console.log("UNDEFINED UPDATE");
                return;
            }
            const gameStateUpdate = data.update as IStateUpdate;
            const stateUpdateTargetPlayerID = gameStateUpdate.intendedTarget;
            if (stateUpdateTargetPlayerID != null && stateUpdateTargetPlayerID != this.userID) {
                return; // Ignore data not intended for this user..
            }
            if (gameStateUpdate.updateType == undefined) {
                console.log("UPDATE TYPE UNDEFINED");
                return;
            }
            if (gameStateUpdate.updateData == undefined) {
                console.log("UPDATE DATA UNDEFINED");
                return;
            }
            this.menuManager.stateUpdateController.updateLocalData(gameStateUpdate);
        });
    }

    unsubscribe() {
        this.subscription.unsubscribe();
        this.subscription = null;
    }

    publish(update: IStateUpdate) {
        const data = {update: update, userID: this.userID};
        console.log("Publishing data: ", data);
        const stringified = JSON.stringify(data);
        this.graphQLTool.publish(this.channel!, stringified);
    }
}
