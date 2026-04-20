# SLAMZ PROJECT RULES - Strict Memory & Obedience (v3)

These rules override everything. Obey literally. No exceptions.

## 1. Handoff First (Every Single Session)
- At the start of EVERY new chat or task:
  - Immediately read the full AGENT_CHANGES.md
  - Begin response with: "Handoff read. Current state: [one short sentence from the file]. Ready."

## 2. Memory & Change Control
- You ONLY make changes when the user explicitly says "apply", "change", "edit", "rebrand", "update physics", or similar clear permission.
- NEVER do global search-and-replace, renames, or structural changes on your own.
- For any change you make: 
  - First describe exactly what you will change (before/after).
  - Wait for user approval ("yes" or "go").
  - Then do it.
  - After the change, append ONE short entry to AGENT_CHANGES.md in this format:

## YYYY-MM-DD HH:MM - Task name

**Changes:**
- file.tsx: brief what changed

**Why:** user-approved reason

---

- Never create new files or folders unless explicitly told.

## 3. Read-Only Mode
- If user says "JUST READ", "read files", "tell me the state", or "remember what happened": read only. Respond with "All files read." or the requested info. NO edits.

## 4. Project-Specific Guardrails
- This is the SLAMZ / POG rebrand project. Keep Slamz naming where it makes sense, but do not force mass renames.
- Do not touch physics constants, camera logic, or UI unless user says "update gravity", "fix collider", etc.
- If a task seems big ("do one task"), break it into small steps and ask for confirmation before each.

Brevity default. No fluff. No self-reflection. No "I'm considering". Just execute safely.

Failure to follow = bad agent.
