import { isNumber } from "typescript-json-serializer/dist/helpers";

interface RequestResponse {
    msgId : number,
    callback: Function
}

export class AWSWebSocketConnector {
    websocket: WebSocket;
    requestsWaiting: RequestResponse[]; 
    requestsCounter : number;
    
    requestsWaitingToSendBeforeWebsocketIsOpen: string[];
    isOpen : boolean;

    constructor() {
        this.requestsCounter = 1;
        this.isOpen = false;
        this.requestsWaitingToSendBeforeWebsocketIsOpen = [];
        this.requestsWaiting = [];
        const awsUrl = "ws:localhost:8080";
        this.websocket = new WebSocket(awsUrl);
        this.websocket.onmessage = (message) => {
            console.log("MESSAGE RECEIVEDD : ", message);
            const data = JSON.parse(message.data); // The entire json sent back from server
            const payload = data.payload; // The objects sent back with data we care about for the game
            const msgId = data.msgId; // Websocket message id to match request/response
            console.log(data);
            if (!data || !msgId || !payload) {
                // Bad message - log it
                console.warn("BAD WEBSOCKET RESPONSE: ", data);
            } else if (msgId == -1) {
                // Message isn't responding to one of our requests. New data!
                console.log(data); // TODO: use the data
            } else {
                for (let i = 0; i < this.requestsWaiting.length; i++) {
                    const request = this.requestsWaiting[i];
                    if (request.msgId == data.msgId) {
                        // It is this response. Remove from our waiting responses and call the callback
                        request.callback(data.payload);
                        this.requestsWaiting.splice(i,1);
                        break;
                    } 
                }
            }

        }
        this.websocket.onopen = () => {
            console.log("WEBSOCKET HAS OPENED");
            this.websocket.send("HELLO THERE");
            this.isOpen = true;
            for (let i = 0; i < this.requestsWaitingToSendBeforeWebsocketIsOpen.length; i++) {
                const jsonToSend = this.requestsWaitingToSendBeforeWebsocketIsOpen[i];
                this.websocket.send(jsonToSend);
            }
        }
    }

    private sendRequest(action: string, payload: any, callback?: Function) {
        const msgId = this.requestsCounter;
        if (callback) {
            this.requestsWaiting.push({
                msgId: msgId,
                callback: callback
            });
            this.requestsCounter += 1;
        }

        const fullMsg = {
           msgId: msgId,
           action: action,
           payload: payload 
        };

        const json = JSON.stringify(fullMsg);
        console.log(fullMsg);
        if (this.isOpen) {
            this.websocket.send(json);
        }
        else {
            this.requestsWaitingToSendBeforeWebsocketIsOpen.push(json);
        }
    }

    createLobby(callback?: Function) {
        const msg = {
            notused : "notused"
        }
        this.sendRequest("createLobby", msg, callback);
    }

    joinLobby(gameId: String, callback: Function) {
        const msg = {
            gameId: gameId
        }
        this.sendRequest("joinLobby", msg, callback);
    }

    sendMessage(payload: Object, targetPlayer?: string, callback?: Function) {
        const msg = payload;
        this.sendRequest("messageLobby", msg, callback);
    }
}