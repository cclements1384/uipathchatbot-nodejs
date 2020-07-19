import { MessageFactory, TurnContext, StatePropertyAccessor, UserState, InputHints } from 'botbuilder';
import { ComponentDialog,
    DialogSet,
    DialogState,
    DialogTurnStatus,
    WaterfallStepContext,
    DialogTurnResult,
    TextPrompt,
    WaterfallDialog
 } from 'botbuilder-dialogs';
 import { UiPathUserProfileDialog } from './uipathUserProfileDialog';

const WATERFALL_DIALOG = "WATERFALL_DIALOG";
const WELCOME_PROMPT = "WELCOME_PROMPT";
const USERCREATE_DIALOG = "USERCREATE_DIALOG";

export class MainDialog extends ComponentDialog {
    constructor(userState: UserState, uiPathUserProfileDialog: UiPathUserProfileDialog){
        super('mainDialog');

        /* add the dialog steps */
        this.addDialog(new TextPrompt(WELCOME_PROMPT));
        this.addDialog(uiPathUserProfileDialog);

        /* add the steps */
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
        ]));

        /* initalize the dialog */
        this.initialDialogId = WATERFALL_DIALOG;
    }

    /* the run method, called by the dialog bot */
    public async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>){

        /* create the dialog set */
        const dialogSet = new DialogSet(accessor);
        /* add this dialog to the set */
        dialogSet.add(this);
        

        /* create the dialog Context */
        const dialogContext = await dialogSet.createContext(context);
        /* continue the dialog */
        const result = await dialogContext.continueDialog();

        /* begin the dialog */
        if(result.status === DialogTurnStatus.empty){
            await dialogContext.beginDialog(this.id);
        }

    }

    /* welcome the user to the bot */
    private async introStep(stepContext: WaterfallStepContext) {

        /* compose a message to the user */
        const welcomeMessage = (stepContext.options as any).restartMsg ? (stepContext.options as any).restartMsg : `What can I help you with today?\n  You can say something like "Create a new user".`;

        const promptMessage = MessageFactory.text(welcomeMessage, welcomeMessage, InputHints.ExpectingInput);

        return await stepContext.prompt(WELCOME_PROMPT, {prompt: promptMessage});
    }

    /* dispatch the user to the user create dialog */
    private async actStep(stepContext: WaterfallStepContext) {

        /* did we get a response in the previous set? */
        if(stepContext.result){
            /* begin the create user dialog */
            console.log('Act Step.');
            return await stepContext.beginDialog(USERCREATE_DIALOG);
        }

        return await stepContext.continueDialog();

    }

    /* not sure what is going happen here. */
    private async finalStep(stepContext: WaterfallStepContext){

        console.log("Final Step.");
        return await stepContext.endDialog();

    }
}