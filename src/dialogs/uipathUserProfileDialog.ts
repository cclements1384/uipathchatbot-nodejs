import { StatePropertyAccessor, TurnContext, UserState, BotStatePropertyAccessor } from 'botbuilder';
import {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import { UiPathUserProfile } from '../uipathUserProfile';

const USER_PROFILE = "USER_PROFILE";
const FIRSTNAME_PROMPT = "FIRSTNAME_PROMPT";
const LASTNAME_PROMPT = "LASTNAME_PROMPT";
const USERNAME_PROMPT = "USERNAME_PROMPT";
const EMAILADDRESS_PROMPT = "EMAILADDRESS_PROMPT";
const LICENSE_PROMPT = "LICENSE_PROMPT;"
const WATERFALL_DIALOG = "WATERFALL_DIALOG";
const CONFIRM_PROMPT = "CONFIRM_PROMPT";
const FINAL_STEP = "FINALSTEP_PROMPT"

export class UiPathUserProfileDialog extends ComponentDialog {
    
    private uipathUserProfile: StatePropertyAccessor<UiPathUserProfile>;

    constructor(userState: UserState){
        super('uipathUserProfileDialog');
        
        /* create the propperty */
        this.uipathUserProfile = userState.createProperty(USER_PROFILE);

        /* add the dialogs steps */
        this.addDialog(new TextPrompt(FIRSTNAME_PROMPT));
        this.addDialog(new TextPrompt(LASTNAME_PROMPT));
        this.addDialog(new TextPrompt(USERNAME_PROMPT));
        this.addDialog(new TextPrompt(EMAILADDRESS_PROMPT));
        this.addDialog(new ChoicePrompt(LICENSE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        //this.addDialog(new TextPrompt(FINAL_STEP));

        /* create the waterfall dialog */
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstNameStep.bind(this),
            this.lastNameStep.bind(this),
            this.userNameStep.bind(this),
            this.emailAddressStep.bind(this),
            this.licenseTypeStep.bind(this),
            this.summaryStep.bind(this),
            this.confirmStep.bind(this)
        ]));
        
        /* init the dialog */
        this.initialDialogId = WATERFALL_DIALOG;
    }

    /* dialog run method called by the dialog bot. */
    public async run(turnContext: TurnContext, accessor: StatePropertyAccessor){
        
        /* create the new dialog set */
        const dialogSet = new DialogSet(accessor);

        /* add this dialog. */
        dialogSet.add(this);

        /* create the dialog context */
        const dialogContext = await dialogSet.createContext(turnContext);

        /* await go to the next turn */
        const result = await dialogContext.continueDialog();

        /* begin the dialog */
        if(result.status === DialogTurnStatus.empty){
            await dialogContext.beginDialog(this.id);
        }
    }

    /* dialog steps */
    private async firstNameStep(stepContext: WaterfallStepContext){

        /* prompt the user for the firsaname */
        return await stepContext.prompt(FIRSTNAME_PROMPT, "What is the user's first name?");

    }

    private async lastNameStep(stepContext: WaterfallStepContext<UiPathUserProfile>){
        
        /* assign the value (firstName) collected in the previous step */
        stepContext.options.firstName = stepContext.result;

        /* prompt the user for the last name */
        return await stepContext.prompt(LASTNAME_PROMPT, "what is the user's last name?");

    }

    private async userNameStep(stepContext: WaterfallStepContext<UiPathUserProfile>){

        /* assign the value (lastname) collected in the previous step. */
        stepContext.options.lastName = stepContext.result;

        /* prompting the user for user's usenname */
        return await stepContext.prompt(USERNAME_PROMPT, "What is the user's ID (username)?");

    }

    private async emailAddressStep(stepContext: WaterfallStepContext<UiPathUserProfile>){

        /* assign the username which was collected in the previous step */
        stepContext.options.userName = stepContext.result;

        /* prompt the user for the last name. */
        return await stepContext.prompt(EMAILADDRESS_PROMPT, "What is the user's E-mail address?");
    }

    private async licenseTypeStep(stepContext: WaterfallStepContext<UiPathUserProfile>){

        /* assign the E-mail address collected in the previous step */
        stepContext.options.emailAddress = stepContext.result;

        /* prompt the user for the license type */
        return await stepContext.prompt(LICENSE_PROMPT, {
            choices: ChoiceFactory.toChoices(['UiPath Studio X', 'UiPath Studio','UiPath Assistant']),
            prompt: "Which license type shall I assign to the user?"
        });
    }

    private async summaryStep(stepContext: WaterfallStepContext<UiPathUserProfile>){

        /* if we received a result from the previous step */
        if(stepContext.result){

            /* assign the license type collected in the previous step */
            stepContext.options.licenseType = stepContext.result.value;

            /* get the user profile */
            const uipathUserProfile = await this.uipathUserProfile.get(stepContext.context, new UiPathUserProfile());
            const stepContextOptions = stepContext.options;

            /* hydrate the userprofile from the stepContext.options. */
            uipathUserProfile.firstName = stepContextOptions.firstName;
            uipathUserProfile.lastName = stepContextOptions.lastName;
            uipathUserProfile.userName = stepContextOptions.userName;
            uipathUserProfile.emailAddress = stepContextOptions.emailAddress;
            uipathUserProfile.licenseType = stepContext.options.licenseType;

            /* compose a message to send to the user */
            const message = `Ok, I have the following user details:\n 
            FirstName: ${stepContext.options.firstName}\n
            LastName: ${stepContext.options.lastName}\n
            Username: ${stepContext.options.userName}\n
            E-mail Address: ${stepContext.options.emailAddress}\n
            License Type: ${stepContext.options.licenseType}`;

            /* prompt the user to confirm the information */
            await stepContext.context.sendActivity(message);
            return await stepContext.prompt(CONFIRM_PROMPT, { prompt: 'Do you want me to create this user?'})
        }

       
    }

    private async confirmStep(stepContext: WaterfallStepContext){

        if(stepContext.result){
            return await stepContext.endDialog();
        }
        else
            return await stepContext.continueDialog();

    }
}