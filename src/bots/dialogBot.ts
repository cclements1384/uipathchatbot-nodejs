// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, BotState, ConversationState, StatePropertyAccessor, UserState  } from 'botbuilder';
import { Dialog, DialogState } from 'botbuilder-dialogs';
//import { UserProfileDialog } from '../dialogs/userProfileDialog';
import { UiPathUserProfileDialog } from '../dialogs/uipathUserProfileDialog'; 
import { MainDialog } from '../dialogs/mainDialog';
export class DialogBot extends ActivityHandler {
    private conversationState: BotState;
    private userState: BotState;
    private dialog: Dialog;
    private dialogState: StatePropertyAccessor<DialogState>;
    /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState: BotState, userState: BotState, dialog: Dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState as ConversationState;
        this.userState = userState as UserState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            await (this.dialog as UiPathUserProfileDialog).run(context, this.dialogState);

            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });

        /* this fires when new users are added to the coversation. */
        this.onMembersAdded(async (context, next) =>{

            /* loop across all members in the conversation */
            for(const index in context.activity.membersAdded){
                /* if the user is not a bot send them a message */
                if(context.activity.membersAdded[index].id === context.activity.recipient.id){
                    await context.sendActivity("Hi, I am ROC-E your UiPath virtual assistant.");
                    await context.sendActivity(`I can help you enroll new users into the Citizen Automation program. Start by typing "enroll".`);
                }

            }
            /* ensure the next bot handler is called */
            await next();
        });
    }
}
