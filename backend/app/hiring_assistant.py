import json
import os

from app.hr_data import CANDIDATES, EMPLOYEES, OPEN_ROLES

MODEL = "claude-opus-5-5"

SYSTEM_PROMPT = (
    "You are an HR decision-support assistant for a retail FMCG company. You help "
    "HR staff decide who to hire for open roles and who to promote from within, "
    "using ONLY the roster data provided below -- never invent people, scores, or "
    "facts that aren't in it. When asked to choose, name a clear top recommendation, "
    "back it with 2-4 bullet reasons grounded in the data, and name the main risk or "
    "tradeoff. If the data doesn't support an answer, say so plainly instead of "
    "guessing. Keep answers under ~180 words unless asked for more detail."
)


class HiringAssistantError(RuntimeError):
    """Raised for any condition the API route should report as a clean error
    (missing key, declined answer, upstream failure) rather than a 500."""


def _roster_block() -> str:
    return json.dumps(
        {"openRoles": OPEN_ROLES, "candidates": CANDIDATES, "employees": EMPLOYEES},
        indent=2,
    )


def ask_hiring_assistant(question: str) -> str:
    question = (question or "").strip()
    if not question:
        raise HiringAssistantError("Question cannot be empty.")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HiringAssistantError(
            "The hiring assistant isn't configured yet -- set ANTHROPIC_API_KEY on the server."
        )

    try:
        import anthropic
    except ImportError as e:
        raise HiringAssistantError("The hiring assistant's SDK isn't available on this server.") from e

    client = anthropic.Anthropic(api_key=api_key)

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=[
                {"type": "text", "text": SYSTEM_PROMPT},
                {
                    "type": "text",
                    "text": f"Current roster data (JSON):\n{_roster_block()}",
                    "cache_control": {"type": "ephemeral"},
                },
            ],
            messages=[{"role": "user", "content": question}],
        )
    except anthropic.AuthenticationError as e:
        raise HiringAssistantError("The hiring assistant's API key was rejected.") from e
    except anthropic.RateLimitError as e:
        raise HiringAssistantError(
            "The hiring assistant is rate-limited right now -- try again shortly."
        ) from e
    except anthropic.APIStatusError as e:
        raise HiringAssistantError(f"The hiring assistant failed: {e.message}") from e
    except anthropic.APIConnectionError as e:
        raise HiringAssistantError(
            "Couldn't reach the hiring assistant -- check network connectivity."
        ) from e

    if response.stop_reason == "refusal":
        raise HiringAssistantError("The hiring assistant declined to answer that question.")

    text = "".join(block.text for block in response.content if block.type == "text").strip()
    return text or "The assistant didn't return a response."
