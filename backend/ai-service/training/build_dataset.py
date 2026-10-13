"""Build the dashboard-scoped fine-tuning dataset for the Mess Guide assistant.

Unlike a flat Q/A dump, this generates samples *per dashboard scope* using the exact
same system prompt the runtime uses (`tools.contract_system_prompt(scope)`), so training
teaches the model what the live service expects: dashboard scope, out-of-scope refusal,
and the strict-JSON action format.

Sources:
  * GUIDES           - curated Q/A per dashboard.
  * CROSS_QUESTIONS  - questions from other dashboards, answered with a scoped refusal.
  * TOOL examples    - instruction -> action JSON, pulled from tools_schema.json.
  * EXTRA_TOOL_CALLS - a few higher-value phrasings for common dashboard asks.

Run:  python build_dataset.py
Output: data/guide_train.jsonl, data/guide_eval.jsonl
"""

from __future__ import annotations

import json
import random
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))  # so we can import the runtime tools module

import tools  # noqa: E402  (path configured above)

OUT_DIR = HERE / "data"
RANDOM_SEED = 42
EVAL_RATIO = 0.1

# ---------------------------------------------------------------------------
# Per-dashboard guide knowledge. Each entry: one answer, several phrasings.
# ---------------------------------------------------------------------------
GUIDES: dict[str, list[dict]] = {
    "home": [
        {"q": ["What is this project?", "What does this app do?", "What is the Smart Mess & KFC Campus OS?"],
         "a": "Smart Mess & KFC Campus OS is the KIET dining operations platform. It links the campus governance tiers - students, room leads, floor incharges, block coordinators, the mess incharge, the principal and KFC staff - so students mark meals before the 10:00 PM cutoff, the numbers roll up automatically, and the kitchen cooks to the forecasted count."},
        {"q": ["Which roles exist?", "How many portals are there?", "List the user roles."],
         "a": "There are seven role portals plus a campus admin switchboard: Student, Room Lead, Floor Incharge, Block Coordinator, Mess Incharge, Principal and KFC Staff. Admin has universal access."},
        {"q": ["What is the meal cutoff?", "By when must students choose meals?"],
         "a": "Students confirm breakfast, lunch, snacks and dinner before the 10:00 PM (22:00) cutoff. After that the headcount rolls up to the kitchen and the menu locks for the next day."},
        {"q": ["How does the forecasting work?", "How does the AI predict turnout?"],
         "a": "A Weighted Moving Average over the last 14 days of turnout (newest weighted highest) plus a day-of-week seasonality factor and an optional scenario factor. It returns a predicted headcount, a confidence interval, a roughly 4.2% buffer and itemised kitchen batch quantities."},
        {"q": ["What is the tech stack?", "What is this built with?"],
         "a": "React 18 with Vite and Tailwind on port 3000, an Express REST API with MongoDB on port 5000 using JWT auth and role-based access control, an optional Python FastAPI microservice on port 8000 for AI, and HTML5 BroadcastChannel for cross-tab sync."},
        {"q": ["Who are you?", "What is Mess Guide?"],
         "a": "I am Mess Guide, the assistant embedded in this platform. I adapt to whichever dashboard is open and can explain the system or fetch live data for that dashboard."},
    ],
    "student": [
        {"q": ["What is on the menu today?", "Show me today's mess menu."],
         "a": "Let me pull today's menu for you."},
        {"q": ["By when do I have to select my meals?", "What is the student meal cutoff?"],
         "a": "Confirm breakfast, lunch, snacks and dinner before the 10:00 PM cutoff. After that the headcount rolls up to the kitchen."},
        {"q": ["How many KFC orders can I place?", "Is there a limit on KFC orders?"],
         "a": "A maximum of 5 KFC Express orders per day, with only one active order at a time - collect or cancel the current order before placing another."},
        {"q": ["How long is the KFC cancellation window?", "Can I cancel my KFC order?"],
         "a": "You can cancel within 2 minutes of placing the order. Cancelling restores the item stock automatically."},
        {"q": ["How do KFC tokens work?", "What is my token?"],
         "a": "Each order gets a token like KFC-D101-42 that tracks it through Pending, Preparing, Ready and Collected."},
        {"q": ["What is the cheapest item at the canteen?", "Which KFC item is cheapest?"],
         "a": "Let me look up the live KFC prices for you."},
        {"q": ["What is the most expensive canteen item?"],
         "a": "Let me check the live KFC menu to find the priciest item."},
        {"q": ["What is my KFC order status?", "Show my orders."],
         "a": "Let me fetch your current KFC orders."},
    ],
    "room-lead": [
        {"q": ["What do I do on this dashboard?", "What does the Room Lead Hub do?"],
         "a": "You verify each room member's meal preferences, sign off the room roster, and mark members on leave so their meals are excluded from the headcount."},
        {"q": ["How do I mark a roommate on leave?"],
         "a": "Open the member row and mark them on leave - their meals are then excluded from the floor rollup."},
        {"q": ["When is the submission deadline?"],
         "a": "Room submissions must be completed before the 10:00 PM cutoff so counts can roll up to the kitchen."},
    ],
    "floor-incharge": [
        {"q": ["What does the Floor Incharge console do?", "What is this dashboard for?"],
         "a": "It tracks attendance and participation across the floor's rooms, flags rooms that have not submitted, and raises cutoff alerts before 10:00 PM."},
        {"q": ["How do I flag a room?"],
         "a": "Use the flag control on the room row; flagged rooms are surfaced to the block coordinator for follow-up."},
        {"q": ["What is the cut-off for floors?"],
         "a": "All floor rooms must submit before the 10:00 PM cutoff."},
    ],
    "block-coordinator": [
        {"q": ["What does the Block Coordinator do?", "What is this hub for?"],
         "a": "You consolidate the finalised meal counts for Block D and Block E and transmit them to the mess kitchen, and you can nudge floor incharges or room leads with pending submissions."},
        {"q": ["Which block has the highest participation?", "Which block is highest?", "Compare Block D and Block E."],
         "a": "Let me pull the live per-block performance for you."},
        {"q": ["How do I send the consolidated count to the kitchen?"],
         "a": "Use the send consolidated count action once both blocks have finalised; it forwards the numbers to the Mess Incharge."},
    ],
    "mess": [
        {"q": ["How does the headcount forecast work?", "Explain the forecast."],
         "a": "A 14-day Weighted Moving Average with day-of-week seasonality and an optional scenario factor, returning a predicted headcount, confidence, buffer portions and kitchen batch quantities."},
        {"q": ["What scenarios can I simulate?", "What-if options?"],
         "a": "standard, rainy (+8%), exam week (+12%), weekend leave (-18%) and festival feast (+15%). Each recalculates the predicted headcount and batch sizing."},
        {"q": ["How much food waste did we have last week?", "What was our wastage?", "Show me the wastage for the last 2 months."],
         "a": "Let me pull the wastage analytics for you."},
        {"q": ["How many students are we cooking for tomorrow?", "What is the headcount?"],
         "a": "Let me fetch the consolidated headcount."},
        {"q": ["Do we have any anomalies today?", "Any dining issues flagged?"],
         "a": "Let me check the current anomalies."},
        {"q": ["How do I size the kitchen batch?"],
         "a": "The forecast gives a prep target (predicted plus a roughly 4.2% buffer) and converts it to rice, dal, veg/paneer, rotis and oil quantities automatically."},
    ],
    "principal": [
        {"q": ["What does the Principal dashboard show?", "What is this dashboard for?"],
         "a": "Campus-wide analytics: participation rates, institutional wastage trends, predicted-versus-actual performance, block rankings and executive directives."},
        {"q": ["What is the campus wastage trend?", "How is wastage trending?"],
         "a": "Let me pull the wastage analytics."},
        {"q": ["Which block is performing best?", "Which block is highest?"],
         "a": "Let me fetch the per-block performance."},
        {"q": ["Give me the campus overview.", "How is the mess performing overall?"],
         "a": "Let me pull the executive analytics."},
    ],
    "kfc": [
        {"q": ["What is on the KFC menu?", "Show me the KFC menu."],
         "a": "Let me pull the live KFC menu with prices and stock."},
        {"q": ["Which item is sold out?", "What is out of stock?"],
         "a": "Let me check the live KFC stock levels."},
        {"q": ["Show me the order queue.", "What orders are pending?"],
         "a": "Let me fetch the current KFC orders."},
        {"q": ["What are the order statuses?"],
         "a": "Orders move through Pending, Preparing, Ready and Collected; the queue reflects each order's current stage in real time."},
    ],
    "admin": [
        {"q": ["What does the admin switchboard do?", "What is this dashboard for?"],
         "a": "It is the campus superadmin switchboard: role switching, user account provisioning and system health monitoring across every portal."},
        {"q": ["How do I reseed the database?"],
         "a": "Admins and dev environments can run the seeder via POST /api/seeder/run, or npm run seed from the backend folder."},
        {"q": ["Which ports do the services use?"],
         "a": "Frontend 3000, Express API 5000, and the optional FastAPI AI service on 8000."},
    ],
}

# ---------------------------------------------------------------------------
# Out-of-scope questions per dashboard: the assistant must decline politely.
# The decline text is generated from the scope's own label and focus.
# ---------------------------------------------------------------------------
CROSS_QUESTIONS: dict[str, list[str]] = {
    "home": ["How much food waste last week?", "What is my KFC order status?", "Which block has the highest participation?"],
    "student": ["How much food waste did the kitchen have last month?", "Which block has the highest participation?",
                "Show me the KFC order queue for staff.", "Give me the campus-wide analytics."],
    "room-lead": ["What is the campus wastage trend?", "How many students opted for dinner across campus?",
                  "Place a KFC order for me."],
    "floor-incharge": ["Which block is highest?", "What is my KFC token?", "Show the mess menu."],
    "block-coordinator": ["How much food waste last week?", "What is my KFC order status?", "Take me to the student portal."],
    "mess": ["What is my KFC token?", "How many KFC orders are pending?", "What is my meal selection?"],
    "principal": ["What is my KFC order status?", "Place a KFC order for me."],
    "kfc": ["What is the mess menu?", "How many students opted for lunch?", "Show me the campus wastage trend."],
    "admin": ["What is the weather today?", "Book me a flight to Delhi."],
}

# ---------------------------------------------------------------------------
# Extra high-value tool-call phrasings per scope (beyond the schema examples).
# ---------------------------------------------------------------------------
EXTRA_TOOL_CALLS: dict[str, list[tuple[str, str, dict]]] = {
    "student": [
        ("What's the cheapest thing at the canteen?", "get_kfc_menu", {}),
        ("Show me the priciest canteen item", "get_kfc_menu", {}),
        ("Show my KFC orders", "get_kfc_orders", {}),
        ("Opt me out of dinner", "set_meal_selection", {"meal": "dinner", "selected": False}),
        ("I'll eat breakfast tomorrow", "set_meal_selection", {"meal": "breakfast", "selected": True}),
        ("Order two veg rice bowls", "place_kfc_order", {"items": [{"name": "Veg Rice Bowl", "qty": 2}]}),
    ],
    "mess": [
        ("How much waste did we have last week?", "get_wastage", {}),
        ("Show the wastage for the last 2 months", "get_wastage", {}),
        ("Which block is highest?", "get_block_performance", {}),
        ("Predict tomorrow's lunch headcount", "get_forecast", {"meal": "Lunch"}),
        ("Any anomalies today?", "get_anomalies", {}),
        ("What is the headcount for dinner?", "get_headcount", {}),
    ],
    "principal": [
        ("Show the campus wastage trend", "get_wastage", {}),
        ("Which block is performing best?", "get_block_performance", {}),
        ("Give me the campus overview", "get_principal_analytics", {}),
        ("Any anomalies across campus?", "get_anomalies", {}),
    ],
    "kfc": [
        ("Which items are out of stock?", "get_kfc_menu", {}),
        ("Show the live order queue", "get_kfc_orders", {}),
    ],
    "block-coordinator": [
        ("Which block has the highest participation?", "get_block_performance", {}),
        ("Show tomorrow's consolidated headcount", "get_headcount", {}),
    ],
}


def authority_decline(scope: str) -> str:
    cfg = tools.scope_config(scope)
    return f"That's outside what I can help with on the {cfg['label']}. I can only help with {cfg['focus']} here."


def answer_json(text: str) -> str:
    return json.dumps({"type": "answer", "text": text}, ensure_ascii=False)


def action_json(tool: str, args: dict) -> str:
    return json.dumps({"type": "action", "tool": tool, "args": args}, ensure_ascii=False)


def record(system: str, user: str, assistant: str) -> dict:
    return {"messages": [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
        {"role": "assistant", "content": assistant},
    ]}


def build_samples() -> list[dict]:
    samples: list[dict] = []

    for scope in tools.SCOPES:
        system = tools.contract_system_prompt(scope)

        for seed in GUIDES.get(scope, []):
            for phrasing in seed["q"]:
                samples.append(record(system, phrasing, answer_json(seed["a"])))

        # A scoped refusal for every out-of-scope question.
        for question in CROSS_QUESTIONS.get(scope, []):
            samples.append(record(system, question, answer_json(authority_decline(scope))))

        # Tool-call samples from the schema examples, limited to this scope's tools.
        allowed = tools.scope_tool_names(scope)
        for name, tool in tools.TOOLS.items():
            if allowed is not None and name not in allowed:
                continue
            for example in tool.get("examples", []):
                samples.append(record(system, example["instruction"], action_json(name, example["args"])))

        for instruction, tool_name, args in EXTRA_TOOL_CALLS.get(scope, []):
            samples.append(record(system, instruction, action_json(tool_name, args)))

    return samples


def split(samples: list[dict], eval_ratio: float = EVAL_RATIO) -> tuple[list[dict], list[dict]]:
    rng = random.Random(RANDOM_SEED)
    rng.shuffle(samples)
    cut = max(1, int(len(samples) * eval_ratio))
    return samples[cut:], samples[:cut]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def main() -> None:
    samples = build_samples()
    train_rows, eval_rows = split(samples)

    train_path = OUT_DIR / "guide_train.jsonl"
    eval_path = OUT_DIR / "guide_eval.jsonl"
    write_jsonl(train_path, train_rows)
    write_jsonl(eval_path, eval_rows)

    answers = sum(1 for r in samples if '"type": "answer"' in r["messages"][-1]["content"])
    actions = len(samples) - answers

    per_scope = Counter()
    for row in samples:
        system = row["messages"][0]["content"]
        match = next((key for key, cfg in tools.SCOPES.items() if cfg["label"] in system), "?")
        per_scope[match] += 1

    print(f"Total samples : {len(samples)}")
    print(f"  answer      : {answers}")
    print(f"  action      : {actions}")
    print(f"Train / eval  : {len(train_rows)} / {len(eval_rows)}")
    print("Per dashboard:")
    for key, count in per_scope.most_common():
        print(f"  {tools.scope_config(key)['label']:<32} {count}")
    print(f"Wrote {train_path}")
    print(f"Wrote {eval_path}")


if __name__ == "__main__":
    main()
