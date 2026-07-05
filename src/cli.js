// CLI face for the agent. Interactive chat loop.
import readline from "readline";
import { createAgent } from "./agent.js";

const agent = createAgent();
const SHOW_STEPS = process.argv.includes("--verbose");

function logStep(step) {
  if (!SHOW_STEPS) return;
  if (step.type === "tool") console.log(`   ⚙️  ${step.name}(${JSON.stringify(step.args)})`);
}

async function once(q) {
  const { text } = await agent.ask(q, logStep);
  console.log(`\n🎙️  Hitesh: ${text}\n`);
}

function chat() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log("🎙️  Hitesh persona agent. Type 'exit' to quit.\n");
  const loop = () =>
    rl.question("🧑 You: ", async (input) => {
      const msg = input.trim();
      if (!msg) return loop();
      if (["exit", "quit", "bye"].includes(msg.toLowerCase())) {
        console.log("\n🎙️  Hitesh: Chalo, milte hain. Code karte raho!\n");
        return rl.close();
      }
      try {
        const { text } = await agent.ask(msg, logStep);
        console.log(`\n🎙️  Hitesh: ${text}\n`);
      } catch (e) {
        console.error("Error:", e.message);
      }
      loop();
    });
  loop();
}

// node src/cli.js "question"   -> one-shot
// node src/cli.js              -> interactive
const oneShot = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ");
if (oneShot) once(oneShot);
else chat();
