import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  buildRestUrl,
  loginToken,
  configFromEnv,
  makeServer,
} from "../mcp-server/moodlemcp.mjs";

function startMockMoodle(handler) {
  const server = http.createServer(handler);
  server.listen(0, "127.0.0.1");
  return new Promise((resolve) => {
    server.on("listening", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

function childSend(child, message) {
  child.stdin.write(JSON.stringify(message) + "\n");
}

async function childCall(child, method, params) {
  const id = childCall._id = (childCall._id || 0) + 1;
  childSend(child, { jsonrpc: "2.0", id, method, params });
  const [line] = await once(child.stdout, "line");
  return JSON.parse(line);
}

test("buildRestUrl assembles the Moodle REST endpoint", () => {
  const url = buildRestUrl("https://emas3.ui.ac.id", "tok123", "core_enrol_get_users_courses", {
    userid: 7,
  });
  assert.equal(
    url.toString(),
    "https://emas3.ui.ac.id/webservice/rest/server.php?wstoken=tok123&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json&userid=7",
  );
});

test("configFromEnv validates and normalises settings", () => {
  const config = configFromEnv({ MOODLE_URL: "https://emas3.ui.ac.id///", MOODLE_TOKEN: "t" });
  assert.equal(config.siteUrl, "https://emas3.ui.ac.id");
  assert.equal(config.token, "t");
  assert.throws(() => configFromEnv({}), /MOODLE_URL/);
  assert.throws(() => configFromEnv({ MOODLE_URL: "emas3.ui.ac.id" }), /http/);
});

test("loginToken returns token on success and throws on failure", async () => {
  const { server, port } = await startMockMoodle((req, res) => {
    res.setHeader("content-type", "application/json");
    if (req.url.startsWith("/login/token.php")) {
      const url = new URL(req.url, "http://x");
      if (url.searchParams.get("password") === "bad") {
        res.end(JSON.stringify({ error: "invalidlogin" }));
      } else {
        res.end(JSON.stringify({ token: "abc" }));
      }
    } else {
      res.end(JSON.stringify({}));
    }
  });
  try {
    const token = await loginToken(`http://127.0.0.1:${port}`, "u", "p", "moodle_mobile_app");
    assert.equal(token, "abc");
    await assert.rejects(
      loginToken(`http://127.0.0.1:${port}`, "u", "bad", "nope"),
      /Moodle login failed/,
    );
  } finally {
    server.close();
  }
});

test("server handles initialize, tools/list and tools/call over stdio", async () => {
  const calls = [];
  const { server, port } = await startMockMoodle((req, res) => {
    calls.push(req.url);
    res.setHeader("content-type", "application/json");
    const url = new URL(req.url, "http://x");
    const fn = url.searchParams.get("wsfunction");
    if (fn === "core_webservice_get_site_info") {
      res.end(JSON.stringify({ sitename: "EMAS 3", userid: 42 }));
    } else if (fn === "core_enrol_get_users_courses") {
      assert.equal(url.searchParams.get("userid"), "42");
      res.end(JSON.stringify([{ id: 1, fullname: "Kalkulus" }]));
    } else {
      res.end(JSON.stringify({ exception: "invalid_response", message: "nope" }));
    }
  });
  const child = spawn(process.execPath, ["mcp-server/moodlemcp.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, MOODLE_URL: `http://127.0.0.1:${port}`, MOODLE_TOKEN: "tok" },
  });
  let buffered = "";
  child.stdout.on("data", (chunk) => {
    buffered += chunk.toString();
    let index;
    while ((index = buffered.indexOf("\n")) >= 0) {
      const line = buffered.slice(0, index);
      buffered = buffered.slice(index + 1);
      if (line) child.stdout.emit("line", line);
    }
  });
  try {
    const init = await childCall(child, "initialize", {});
    assert.equal(init.result.serverInfo.name, "lihatdulu-moodle-mcp");
    assert.equal(init.result.protocolVersion, "2024-11-05");
    childSend(child, { jsonrpc: "2.0", method: "notifications/initialized" });

    const list = await childCall(child, "tools/list", {});
    const names = list.result.tools.map((tool) => tool.name);
    assert.ok(names.includes("list_courses"));
    assert.ok(names.includes("get_assignments"));
    assert.ok(names.includes("raw_call"));

    const courses = await childCall(child, "tools/call", {
      name: "list_courses",
      arguments: {},
    });
    assert.equal(courses.result.isError, false);
    assert.equal(JSON.parse(courses.result.content[0].text)[0].fullname, "Kalkulus");

    const failure = await childCall(child, "tools/call", {
      name: "get_quizzes",
      arguments: { courseid: 1 },
    });
    assert.equal(failure.result.isError, true);
    assert.match(failure.result.content[0].text, /invalid_response/);
  } finally {
    child.kill();
    server.close();
  }
});

test("makeServer returns method-not-found for unknown methods", async () => {
  const responses = [];
  const server = makeServer(configFromEnv({ MOODLE_URL: "https://x.example", MOODLE_TOKEN: "t" }), () => {});
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    responses.push(chunk);
    return true;
  };
  try {
    await server.handleLine(JSON.stringify({ jsonrpc: "2.0", id: 9, method: "bogus/method" }));
  } finally {
    process.stdout.write = originalWrite;
  }
  const parsed = JSON.parse(responses[0]);
  assert.equal(parsed.error.code, -32601);
});
