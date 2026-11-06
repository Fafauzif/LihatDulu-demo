# LihatDulu Moodle MCP Server

A zero-dependency Node.js [Model Context Protocol](https://modelcontextprotocol.io) server that connects AI assistants to a Moodle LMS (e.g. `https://emas3.ui.ac.id`) through Moodle's official Web Services REST API, using the same `moodle_mobile_app` token the official mobile app uses.

## Setup

Get a token with your campus SSO credentials:

```bash
curl "https://emas3.ui.ac.id/login/token.php?username=USERNAME&password=PASSWORD&service=moodle_mobile_app"
```

If your institution uses SSO (no direct Moodle password), open the Moodle mobile app flow once and reuse the token it stores, or ask your site admin for a web service token.

## Run

```bash
MOODLE_URL=https://emas3.ui.ac.id \
MOODLE_TOKEN=<your token> \
node mcp-server/moodlemcp.mjs
```

Or let the server fetch the token itself:

```bash
MOODLE_URL=https://emas3.ui.ac.id \
MOODLE_USERNAME=... MOODLE_PASSWORD=... \
node mcp-server/moodlemcp.mjs
```

## Register with an MCP client

Claude Desktop (`claude_desktop_config.json`), Cursor, or any MCP-capable client:

```json
{
  "mcpServers": {
    "moodle": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/moodlemcp.mjs"],
      "env": {
        "MOODLE_URL": "https://emas3.ui.ac.id",
        "MOODLE_TOKEN": "your token"
      }
    }
  }
}
```

## Tools

| Tool | Moodle function | Purpose |
| ---- | ---- | ------- |
| `get_site_info` | `core_webservice_get_site_info` | Site name, version, user id |
| `list_courses` | `core_enrol_get_users_courses` | Your enrolled courses |
| `get_course_contents` | `core_course_get_contents` | Sections and activities of a course |
| `get_assignments` | `mod_assign_get_assignments` | Assignments with due dates |
| `get_upcoming_events` | `core_calendar_get_calendar_events` | Deadlines and events between dates |
| `get_grades` | `core_grades_get_grades` | Your grades for a course |
| `get_quizzes` | `mod_quiz_get_quizzes_by_courses` | Quizzes with open/close dates |
| `raw_call` | any | Escape hatch for any other web service function |

All tools are read-only from the client's perspective; no submission-upload or write functions are exposed.

## Environment variables

- `MOODLE_URL` (required): base URL of the Moodle site, no trailing slash needed
- `MOODLE_TOKEN`: web service token
- `MOODLE_USERNAME` / `MOODLE_PASSWORD`: alternative to a token; the server calls `login/token.php` once
- `MOODLE_SERVICE`: service name for login, default `moodle_mobile_app`
- `MOODLE_TIMEOUT_MS`: request timeout, default `20000`

## Tests

```bash
node --test tests/moodlemcp.test.js
```

The tests run a loopback mock of the Moodle REST endpoints; no network access is required.
