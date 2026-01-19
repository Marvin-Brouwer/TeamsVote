import { InvokeResponse, TeamsActivityHandler, TurnContext } from 'botbuilder';
import { ITaskModuleResponseOfFetch, TaskModuleContinueResponse } from 'botbuilder-teams';

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

    public async onInvokeActivity(context: TurnContext) {
        if (context.activity.name !== "composeExtension/fetchTask") {
            return await super.onInvokeActivity(context);
        }

        // Grab the command text (if any)
        const commandText = context.activity.value?.parameters?.[0]?.value || "";
        if (!commandText.length) return this.helpResponse()

        const [typeOrName, ...rest] = commandText.split(" ");
        const type = typeOrName.startsWith("--") ? typeOrName.slice(2) : "modified-fibonacci";
        const name = typeOrName.startsWith("--") ? rest.join(" ") : commandText;

        // Return Task Module response
        return this.startResponse(type, name)
    };

    private helpResponse = (): InvokeResponse<string> => ({ status: 200, body: `TODO! this will trigger a help response later` });
    private startResponse(type: string, name: string): InvokeResponse<ITaskModuleResponseOfFetch> {

        // Build modal URL with query params
        const modalUrl = new URL("https://example.com/vote-modal");
        modalUrl.searchParams.set("type", type);
        modalUrl.searchParams.set("name", name);

        const temp = {
            status: 200,
            body: TaskModuleContinueResponse
                .createResponseOfFetch()
                .title("Vote modal")
                .url(modalUrl.toString())
                .width('large')
                .height('large')
                .toResponseOfFetch()
        };
        
        console.warn('temp', temp)

        return temp;
    }
}