const express = require("express");
const cors = require("cors");
const fs = require("fs");
const Docker = require("dockerode");

const app = express();
app.use(cors());
app.use(express.json());

const configFilePath = "/nginx-config/nginx.conf";

// Upstream block templates
const templates = {
  roundrobin: `
upstream task_backend {
    server backend-1:3000;
    server backend-2:3000;
    server backend-3:3000;
}`,
  leastconn: `
upstream task_backend {
    least_conn;
    server backend-1:3000;
    server backend-2:3000;
    server backend-3:3000;
}`,
  iphash: `
upstream task_backend {
    ip_hash;
    server backend-1:3000;
    server backend-2:3000;
    server backend-3:3000;
}`,
  weighted: `
upstream task_backend {
    server backend-1:3000 weight=3;
    server backend-2:3000 weight=1;
    server backend-3:3000 weight=1;
}`,
};

// Wrap the upstream into a full nginx.conf
function buildConfig(upstream) {
  return `
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    ${upstream}

    server {
        listen 80;
        server_name localhost;

        location / {
            root   /usr/share/nginx/html;
            index  index.html;
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://task_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
`;
}
// Helper function to detect the active algorithm from the nginx.conf
function detectAlgorithm(configContent) {
  if (configContent.includes("ip_hash")) return "iphash";
  if (configContent.includes("least_conn")) return "leastconn";
  // Check for weights
  if (configContent.includes("weight=")) return "weighted";
  // Default
  return "roundrobin";
}

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

app.post("/switch-algorithm", async (req, res) => {
  const { algorithm } = req.body;
  if (!templates[algorithm]) {
    return res.status(400).json({
      error:
        "Invalid algorithm. Valid values: roundrobin, leastconn, iphash, weighted",
    });
  }

  try {
    const newConfig = buildConfig(templates[algorithm]);
    fs.writeFileSync(configFilePath, newConfig, "utf8");
    console.log(`Wrote new config for algorithm: ${algorithm}`);

    // Reload Nginx inside its container
    const container = docker.getContainer("nginx");
    const exec = await container.exec({
      Cmd: ["nginx", "-s", "reload"],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({ Detach: false });
    stream.on("data", (chunk) => console.log(chunk.toString()));
    stream.on("end", () => console.log("Nginx reloaded successfully"));

    res.json({ message: `Algorithm switched to ${algorithm}`, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/current-algorithm", (req, res) => {
  try {
    const config = fs.readFileSync(configFilePath, "utf8");
    const algorithm = detectAlgorithm(config);
    res.json({ algorithm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Management API running on port ${PORT}`);
});
