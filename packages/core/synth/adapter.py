import anthropic
from typing import Any, Protocol

class StructuredResult(Protocol):
    pass

class Message(Protocol):
    pass

class LLM(Protocol):
    async def generate(
        self,
        *,
        system: str,
        messages: list[dict],
        schema: dict,
        max_tokens: int,
        temperature: float,
        cache_key: str | None
    ) -> dict: ...

class AnthropicAdapter:
    def __init__(self, api_key: str):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)

    async def generate(
        self,
        *,
        system: str,
        messages: list[dict],
        schema: dict,
        max_tokens: int,
        temperature: float,
        cache_key: str | None = None
    ) -> dict:
        
        # Tools configuration for forced JSON output matching the schema
        tools = [
            {
                "name": "submit_test",
                "description": "Submit the generated test file and expectations.",
                "input_schema": schema
            }
        ]

        response = await self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=messages,
            tools=tools,
            tool_choice={"type": "tool", "name": "submit_test"}
        )

        for content_block in response.content:
            if content_block.type == 'tool_use' and content_block.name == 'submit_test':
                return content_block.input
                
        raise ValueError("Failed to get structured tool use from Claude.")
