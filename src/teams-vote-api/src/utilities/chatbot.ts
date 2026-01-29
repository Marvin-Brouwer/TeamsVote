// import { formatUrlForTitle } from '@teams-vote/client-util';
// import { Deck } from '@teams-vote/data';
// // import { formatUrlForTitle } from '@teams-vote/client-util';
// import { InvokeResponse, TaskModuleRequest, TeamsActivityHandler, TaskModuleResponse, CardFactory, MessagingExtensionActionResponse, TaskModuleTaskInfo, ConversationReference, CloudAdapter } from 'botbuilder';
// import { ITaskModuleResponseOfFetch, TaskModuleContinueResponse } from 'botbuilder-teams';
// import { teamsAdapter } from './teams-adapter.js';
// // import { formatUrlForTitle } from '../../../teams-vote-client-util/src/helpers/url';
// import { APP_ID } from './teams-adapter.js';
import { ActivityHandler, MessageFactory, TurnContext } from '@microsoft/agents-hosting'
import { AdaptiveCardInvokeResponseType, TaskModuleContinueResponse } from '@microsoft/agents-hosting-teams'
import { formatUrlForTitle } from '@teams-vote/client-util';
import { APP_ID, teamsAdapter } from './teams-adapter.js';
import { Activity, ActivityTypes } from '@microsoft/agents-activity';

const appUrl = import.meta.env.VITE_UI_APP_URL as string;
// let conversationReference: Partial<ConversationReference> | undefined = undefined;

// // TODO TEST
// export class ChatBot extends TeamsActivityHandler {
//     constructor() {
//         super();

//         this.onMessage(async (_context, next) => await next())

//         // // Handle messages
//         // this.onMessage(async (context, next) => {
//         //     const text = context.activity.text?.trim().toLowerCase() || "";
//         //     if (text.trim().startsWith('/vote')) {
//         //         await this.triggerHelpResponse(context);
//         //         return await next();
//         //     }
//         //     if (!text.trimEnd().startsWith('/vote ')) return await next();

//         //     // TODO maybe use commandr?
//         //     const command = text.trim().replace('/vote ', '')
//         //     if (command.length < 2) {
//         //         await this.triggerHelpResponse(context);
//         //         return await next();
//         //     }

//         //     const [arg0, ...args] = command.split(' ');
//         //     const type = arg0.startsWith('--') ? arg0.substring(2) : 'modified-fibonacci';
//         //     const name = arg0.startsWith('--') ? args.join(' ') : command

//         //     await this.triggerModal(context, type, name);
//         //     await next();
//         // });
//     }
//     protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {

//         console.log('=========', 'handleTeamsTaskModuleSubmit', '=========')
//         console.log('context', context)
//         console.log('taskModuleRequest', taskModuleRequest)

//         conversationReference = TurnContext.getConversationReference(
//             context.activity
//         );

//         setTimeout(async () => {
//             try {
//                 await teamsAdapter.createConversationAsync(
//                     APP_ID,
//                     conversationReference?.channelId!,
//                     conversationReference?.serviceUrl!,
//                     '',
//                     {
//                         isGroup: context.activity.conversation.isGroup,
//                         channelData: context.activity.channelData!,
//                         bot: context.activity.recipient,
//                         activity: context.activity,
//                     },
//                     async (newContext) => {
//                         await newContext.adapter.continueConversation(
//                             conversationReference!,
//                             async (proactiveContext) => {
//                                 await proactiveContext.sendActivity({
//                                     text: `🗳️ A vote has started 2!`
//                                 });
//                             }
//                         );

//                     }
//                 )
//             }
//             catch (e) {
//                 console.error(e)
//             }
//         }, 3000);


//         // return TaskModuleContinueResponse
//         //     .createResponseOfFetch()
//         //     .title(formatUrlForTitle("test"))
//         //     .url(appUrl + "/teams/tab/")
//         //     .width('medium')
//         //     .height('large')
//         //     .toResponseOfFetch();

//         try {
//             const data = taskModuleRequest.data;

//             // Post message into chat
//             await context.sendActivity({
//                 attachments: [
//                     CardFactory.adaptiveCard({
//                         type: "AdaptiveCard",
//                         version: "1.4",
//                         body: [
//                             {
//                                 type: "TextBlock",
//                                 text: `Vote started! Estimate: ${data.estimate}`,
//                                 weight: "bolder",
//                                 size: "medium"
//                             }
//                         ]
//                     })
//                 ]
//             });

//         } catch (e) {
//             console.error(e)
//         }

//         return TaskModuleContinueResponse
//             .createResponseOfFetch()
//             // .title(formatUrlForTitle("test"))
//             // .url(appUrl + "/teams/tab/")
//             // .width('medium')
//             // .height('large')
//             .card({
//                 type: "AdaptiveCard",
//                 version: "1.4",
//                 body: [
//                     {
//                         type: "TextBlock",
//                         text: `Vote started! Estimate: ${JSON.stringify(taskModuleRequest.data.estimate)}`,
//                         weight: "bolder",
//                         size: "medium"
//                     }
//                 ]
//             })
//             .toResponseOfSubmit() as TaskModuleResponse;
//     }

//     protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
//         console.log('=========', 'handleTeamsTaskModuleFetch', '=========')
//         const card = {
//             type: "AdaptiveCard",
//             $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
//             version: "1.4",
//             body: [{ type: "TextBlock", text: "Vote started!" }]
//         };

//         console.log('taskModuleRequest', taskModuleRequest)

//         // Post directly to the chat or meeting
//         const attachment = CardFactory.adaptiveCard(card);
//         await context.sendActivity({ attachments: [attachment] });

//         const test: MessagingExtensionActionResponse = {
//             task: {
//                 type: "continue",
//                 value: taskModuleRequest.data as TaskModuleTaskInfo
//             }
//         };

//         console.log('test', test)

//         return TaskModuleContinueResponse
//             .createResponseOfFetch()
//             .title(formatUrlForTitle("test"))
//             .url(appUrl + "/teams/tab/")
//             .width('medium')
//             .height('large')
//             .toResponseOfFetch();
//     }
//     // protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {

//     //     console.log("ACTION", action)

//     //     return TaskModuleContinueResponse
//     //         .createResponseOfFetch()
//     //         .title(formatUrlForTitle("test"))
//     //         .url(appUrl + "/teams/tab/")
//     //         .width('medium')
//     //         .height('large')
//     //         .toResponseOfFetch();
//     // }

//     // public async onInvokeActivity(context: TurnContext) {
//     //     if (context.activity.name !== "composeExtension/fetchTask") {
//     //         return await super.onInvokeActivity(context);
//     //     }

//     //     console.log()
//     //     console.log("COMMAND", context.activity)
//     //     console.log()

//     //     const card = CardFactory.heroCard(
//     //         "Voting started!",
//     //         "A new vote has been created by " + context.activity.from.name
//     //     );
//     //     await context.sendActivity({ attachments: [card] });

//     //     // 2️⃣ Return a popup (task module) for the invoking user
//     //     return {
//     //         task: {
//     //             type: "continue",
//     //             value: {
//     //                 title: "Vote Details",
//     //                 width: 400,
//     //                 height: 300,
//     //                 url: `https://your-app.com/TeamsVote/teams/tab/` // popup only visible to user
//     //             }
//     //         }
//     //     };

//     //     return {
//     //         status: 200,
//     //         body: TaskModuleContinueResponse
//     //             .createResponseOfFetch()
//     //             .title(formatUrlForTitle("test"))
//     //             .url(appUrl + "/TeamsVote/teams/tab/")
//     //             .width('medium')
//     //             .height('large')
//     //             .toResponseOfFetch()
//     //     };

//     //     // // Grab the command text (if any)
//     //     // const commandText = context.activity.value?.parameters?.[0]?.value || "";
//     //     // if (!commandText.length) return this.helpResponse()

//     //     // const [typeOrName, ...rest] = commandText.split(" ");

//     //     // const selectedDeckArgument = typeOrName.startsWith("--") ? typeOrName.slice(2) : undefined;
//     //     // const selectedDeck = tryParseDeck(selectedDeckArgument);
//     //     // if (selectedDeck instanceof Error) return this.helpResponse();

//     //     // const roundKey = typeOrName.startsWith("--") ? rest.join(" ") : commandText;

//     //     // // Return Task Module response
//     //     // return this.startResponse(selectedDeck, roundKey)
//     // };

//     private helpResponse = (): InvokeResponse<string> => ({ status: 200, body: `TODO! this will trigger a help response later` });
//     private startResponse(selectedDeck: Deck, roundKey: string): InvokeResponse<ITaskModuleResponseOfFetch> {

//         // Build modal URL with query params
//         const newSessionPath = `./TeamsVote/teams/new/${encodeURIComponent(roundKey)}`;
//         const modalUrl = new URL(newSessionPath, appUrl);
//         modalUrl.searchParams.set("selectedDeck", selectedDeck);

//         return {
//             status: 200,
//             body: TaskModuleContinueResponse
//                 .createResponseOfFetch()
//                 .title(`Vote on ${formatUrlForTitle(roundKey)}`)
//                 .url(modalUrl.toString())
//                 .width('medium')
//                 .height('large')
//                 .toResponseOfFetch()
//         };
//     }
// }

export class ChatBot extends ActivityHandler {
  constructor () {
    super()
    this.onMessage(async (context, next) => {
            // TODO ignore non-mentions https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-and-group-conversations?tabs=typescript
            // // Remove mention text from Text property, this function is altering the text on the Activity.
            // const modifiedText = TurnContext.removeMentionText(turnContext.activity, turnContext.activity.recipient.id);
            // Sends a message activity to the sender of the incoming activity.
      const replyText = `Agent: ${context.activity.text}`
      await context.sendActivity(MessageFactory.text(replyText))
      await next()
    })
    this.onConversationUpdate(async (ctx, next) => {
        console.log('onConversationUpdate', ctx)
        ctx.sendActivity('this is a test');
        await next();
    })
    this.onDialog(async (ctx, next) => {
        console.log('onDialog', ctx)
        ctx.sendActivity('this is a test');
        await next();
    })
    this.onInstallationUpdate(async (ctx, next) => {
        console.log('onInstallationUpdate', ctx)
        ctx.sendActivity('this is a test');
        await next();
    })
  }

  protected async onInvokeActivity(context: TurnContext) {
    console.log("onInvokeActivity", context);

    if (context.activity.name === "task/submit") {
      const value = context.activity.value;
      console.log("Dialog submit value:", value);

      const reference = context.activity.getConversationReference();
      const activity = new Activity(ActivityTypes.Message)
      await teamsAdapter.createConversationAsync(APP_ID, reference.channelId, reference.serviceUrl!, '', { 
        ...context, 
        ...reference, 
        ...reference.conversation,
        activity,
        channelData: undefined,
        isGroup: reference.conversation.isGroup ?? false,
        agent: reference.agent ?? undefined
      }, async (newctx) => {
        console.log('newctx', newctx)
      })
      const rr = await context.sendActivity("This is a test")
      console.log('rr', rr)
      
      // const taskResponse: TaskModuleContinueResponse = {
      //   type: 'continue',
      //   value: {
      //     title: formatUrlForTitle("test"),
      //     url: appUrl + "/teams/tab/",
      //     height: 'medium',
      //     width: 'large'
      //   }
      // }
      const messageResponse: TaskModuleContinueResponse = {
        type: 'message'
      }

      return {
        status: 200,
        body: {
          task: messageResponse
        }
      };
    }

    return super.onInvokeActivity(context);
  }

  protected onUnrecognizedActivity(context: TurnContext): Promise<void> {
        console.warn('onUnrecognizedActivity', context)
        return super.onUnrecognizedActivity(context)
  }
}