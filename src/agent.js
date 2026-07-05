// The agent brain. One reusable core used by both the CLI and the HTTP server.
// Uses native OpenAI function-calling so tool use is reliable (no hand-rolled JSON protocol).
import { client, MODEL } from "./config.js";
import { SYSTEM_PROMPT } from "./persona.js";
import { TOOLS, TOOL_SCHEMAS } from "./tools.js";

const MAX_TURNS = 6; // safety cap on tool-call rounds

export function createAgent() {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];

  // ask(text, onStep?) -> { text, steps }
  // onStep({ type, name, args }) fires for each tool call (optional, for logging/UI).
  async function ask(userText, onStep = () => {}) {
    messages.push({ role: "user", content: userText });
    const steps = [];

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const res = await client.chat.completions.create({
        model: MODEL,
        messages,
        tools: TOOL_SCHEMAS,
        tool_choice: "auto",
      });

      const msg = res.choices[0].message;
      messages.push(msg);

      // No tool calls -> this is the final persona reply.
      if (!msg.tool_calls?.length) {
        return { text: (msg.content ?? "").trim(), steps };
      }

      // Run each requested tool, feed results back, loop.
      for (const call of msg.tool_calls) {
        const name = call.function.name;
        let args = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          /* leave args empty on malformed JSON */
        }
        steps.push({ type: "tool", name, args });
        onStep({ type: "tool", name, args });

        const fn = TOOLS[name];
        let result;
        try {
          result = fn ? await fn(args) : JSON.stringify({ error: `unknown tool ${name}` });
        } catch (err) {
          result = JSON.stringify({ error: String(err.message) });
        }
        messages.push({ role: "tool", tool_call_id: call.id, content: result });
      }
    }
    return { text: "Yaar thoda technical issue aa gaya, dobara try karo.", steps };
  }

  return { ask };
}
