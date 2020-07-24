
import { LuisRecognizer, LuisApplication, LuisRecognizerOptionsV3 } from 'botbuilder-ai';

export class DispatchBot {

    private  recognizer : LuisRecognizer;

    constructor(config : LuisApplication){

        /* bool to hold wheter or not Luis Config was passed in and is value. */
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;

        /* if Luis is connfigured, new it up and provide addtional options */
        if(luisIsConfigured){

            const recognizerOptions : LuisRecognizerOptionsV3 = {
                apiVersion : 'v3'
            };

            this.recognizer = new LuisRecognizer(config,recognizerOptions);


        }
        


    }

}