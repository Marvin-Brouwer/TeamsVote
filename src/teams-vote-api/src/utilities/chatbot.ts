import { formatUrlForTitle } from '@teams-vote/client-util';
import { Deck, tryParseDeck } from '@teams-vote/data';
// import { formatUrlForTitle } from '@teams-vote/client-util';
import { CardFactory, InvokeResponse, MessagingExtensionAction, MessagingExtensionActionResponse, TeamsActivityHandler, TurnContext } from 'botbuilder';
import { ITaskModuleResponseOfFetch, TaskModuleContinueResponse } from 'botbuilder-teams';
// import { formatUrlForTitle } from '../../../teams-vote-client-util/src/helpers/url';

const appUrl = import.meta.env.VITE_UI_APP_URL as string;

// TODO TEST
export class ChatBot extends TeamsActivityHandler {
    constructor() {
        super();

        this.onMessage(async (_context, next) => await next())

        // // Handle messages
        // this.onMessage(async (context, next) => {
        //     const text = context.activity.text?.trim().toLowerCase() || "";
        //     if (text.trim().startsWith('/vote')) {
        //         await this.triggerHelpResponse(context);
        //         return await next();
        //     }
        //     if (!text.trimEnd().startsWith('/vote ')) return await next();

        //     // TODO maybe use commandr?
        //     const command = text.trim().replace('/vote ', '')
        //     if (command.length < 2) {
        //         await this.triggerHelpResponse(context);
        //         return await next();
        //     }

        //     const [arg0, ...args] = command.split(' ');
        //     const type = arg0.startsWith('--') ? arg0.substring(2) : 'modified-fibonacci';
        //     const name = arg0.startsWith('--') ? args.join(' ') : command

        //     await this.triggerModal(context, type, name);
        //     await next();
        // });
    }

    protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {

        console.log("ACTION", action)

        return TaskModuleContinueResponse
            .createResponseOfFetch()
            .title(formatUrlForTitle("test"))
            .url(appUrl + "/TeamsVote/teams/tab/")
            .width('medium')
            .height('large')
            .toResponseOfFetch();
    }

    // public async onInvokeActivity(context: TurnContext) {
    //     if (context.activity.name !== "composeExtension/fetchTask") {
    //         return await super.onInvokeActivity(context);
    //     }

    //     console.log()
    //     console.log("COMMAND", context.activity)
    //     console.log()

    //     const card = CardFactory.heroCard(
    //         "Voting started!",
    //         "A new vote has been created by " + context.activity.from.name
    //     );
    //     await context.sendActivity({ attachments: [card] });

    //     // 2️⃣ Return a popup (task module) for the invoking user
    //     return {
    //         task: {
    //             type: "continue",
    //             value: {
    //                 title: "Vote Details",
    //                 width: 400,
    //                 height: 300,
    //                 url: `https://your-app.com/TeamsVote/teams/tab/` // popup only visible to user
    //             }
    //         }
    //     };

    //     return {
    //         status: 200,
    //         body: TaskModuleContinueResponse
    //             .createResponseOfFetch()
    //             .title(formatUrlForTitle("test"))
    //             .url(appUrl + "/TeamsVote/teams/tab/")
    //             .width('medium')
    //             .height('large')
    //             .toResponseOfFetch()
    //     };

    //     // // Grab the command text (if any)
    //     // const commandText = context.activity.value?.parameters?.[0]?.value || "";
    //     // if (!commandText.length) return this.helpResponse()

    //     // const [typeOrName, ...rest] = commandText.split(" ");

    //     // const selectedDeckArgument = typeOrName.startsWith("--") ? typeOrName.slice(2) : undefined;
    //     // const selectedDeck = tryParseDeck(selectedDeckArgument);
    //     // if (selectedDeck instanceof Error) return this.helpResponse();

    //     // const roundKey = typeOrName.startsWith("--") ? rest.join(" ") : commandText;

    //     // // Return Task Module response
    //     // return this.startResponse(selectedDeck, roundKey)
    // };

    private helpResponse = (): InvokeResponse<string> => ({ status: 200, body: `TODO! this will trigger a help response later` });
    private startResponse(selectedDeck: Deck, roundKey: string): InvokeResponse<ITaskModuleResponseOfFetch> {

        // Build modal URL with query params
        const newSessionPath = `./TeamsVote/teams/new/${encodeURIComponent(roundKey)}`;
        const modalUrl = new URL(newSessionPath, appUrl);
        modalUrl.searchParams.set("selectedDeck", selectedDeck);

        return {
            status: 200,
            body: TaskModuleContinueResponse
                .createResponseOfFetch()
                .title(`Vote on ${formatUrlForTitle(roundKey)}`)
                .url(modalUrl.toString())
                .width('medium')
                .height('large')
                .toResponseOfFetch()
        };
    }
}