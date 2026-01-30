import { ChatBot } from "../utilities/chatbot.js";
import { teamsAdapter } from "../utilities/teams-adapter.js";
import { Router, Request } from "express";

const bot = new ChatBot();
const router = Router();

router.post("/messages", async (req, res) => {

    try {
        await teamsAdapter.process(req, res, async (context) => {
            // context.onSendActivities(async (_c, a, n) => {
            //     console.info(`ctx.onSendActivities ${JSON.stringify(a)}`);
            //     return await n();
            // })
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