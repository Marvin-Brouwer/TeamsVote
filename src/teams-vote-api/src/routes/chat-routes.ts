import { ChatBot, serializeActivity } from "../utilities/chatbot.js";
import { BOT_APP_ID, BOT_APP_PASSWORD, teamsAdapter } from "../utilities/teams-adapter.js";
import { Router } from "express";

const bot = new ChatBot();
const router = Router();

router.post("/messages", async (req, res) => {

    try {

        // Temporary debugging - TODO remove after fixing
        console.log('BOT_APP_ID:', BOT_APP_ID);
        console.log('BOT_APP_PASSWORD exists:', !!BOT_APP_PASSWORD);
        console.log('BOT_APP_PASSWORD length:', BOT_APP_PASSWORD?.length);


        await teamsAdapter.process(req, res, async (context) => {
            context.onSendActivities(async (_c, a, n) => {
                a.forEach((activity, i) => console.info(`ctx.onSendActivities[${i}] ${serializeActivity(activity)}`));
                return await n();
            })
            // context.onUpdateActivity(async (_c, a, n) => {
            //     console.info(`ctx.onUpdateActivity ${JSON.stringify(a)}`);
            //     return await n();
            // })
            await bot.run(context);
        });
    } catch (err) {
        console.error("Unexpected teams bot error:", err);
        return res.status(500).send(JSON.stringify(err));
    }
});

export const chatRoutes = router;