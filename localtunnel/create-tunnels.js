const localtunnel = require("localtunnel");
const fs = require("fs");
const path = require("path");

let tunnel3000 = null;
let tunnel5000 = null;

async function startTunnel(port, name) {
  try {
    const tunnel = await localtunnel({ port });
    console.log(`✅ ${name} (port ${port}) available at: ${tunnel.url}`);
    return tunnel;
  } catch (error) {
    console.error(`❌ Error creating ${name} tunnel:`, error);
    throw error;
  }
}

async function startTunnels() {
  try {
    // Start tunnels sequentially
    tunnel5000 = await startTunnel(5000, "Backend");
    tunnel3000 = await startTunnel(3000, "Frontend");

    // Update frontend environment variables
    const envContent = `
# API Configuration
NEXT_PUBLIC_API_URL=${tunnel5000.url}

# Environment
NODE_ENV=development
`;

    fs.writeFileSync(
      path.join(__dirname, "../web/.env.local"),
      envContent.trim()
    );
    console.log("\n✅ Updated frontend environment variables");

    // Handle tunnel close events
    tunnel3000.on("close", () => {
      console.log("❌ Frontend tunnel closed");
      // Attempt to restart the frontend tunnel
      startTunnel(3000, "Frontend")
        .then((newTunnel) => {
          tunnel3000 = newTunnel;
        })
        .catch(console.error);
    });

    tunnel5000.on("close", () => {
      console.log("❌ Backend tunnel closed");
      // Attempt to restart the backend tunnel
      startTunnel(5000, "Backend")
        .then((newTunnel) => {
          tunnel5000 = newTunnel;
          // Update the environment variables with the new backend URL
          const newEnvContent = `
# API Configuration
NEXT_PUBLIC_API_URL=${newTunnel.url}

# Environment
NODE_ENV=development
`;
          fs.writeFileSync(
            path.join(__dirname, "../web/.env.local"),
            newEnvContent.trim()
          );
          console.log(
            "✅ Updated frontend environment variables with new backend URL"
          );
        })
        .catch(console.error);
    });

    // Keep the process alive
    process.stdin.resume();

    // Handle process termination
    process.on("SIGINT", async () => {
      console.log("\n🛑 Closing tunnels...");
      if (tunnel3000) await tunnel3000.close();
      if (tunnel5000) await tunnel5000.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error in tunnel setup:", error);
    process.exit(1);
  }
}

startTunnels();
