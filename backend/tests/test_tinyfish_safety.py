from app.config import settings
from app.services import tinyfish


def test_payload_strips_descriptions_and_uses_goal():
    schema = {"type": "object", "properties": {"a": {"type": "string", "description": "x"}}}
    p = tinyfish.build_payload("https://example.com", "do it", schema)
    assert p["goal"] == "do it"
    assert "description" not in str(p["output_schema"])


def test_max_steps_sent_only_when_enabled(monkeypatch):
    monkeypatch.setattr(settings, "tinyfish_max_steps", 0)
    assert "agent_config" not in tinyfish.build_payload("https://x.com", "t", {})
    monkeypatch.setattr(settings, "tinyfish_max_steps", 15)
    assert tinyfish.build_payload("https://x.com", "t", {})["agent_config"] == {"max_steps": 15}


def test_daily_cap_blocks_after_limit(monkeypatch):
    monkeypatch.setattr(settings, "tinyfish_daily_run_cap", 2)
    tinyfish._budget.update({"day": None, "runs": 0})
    assert tinyfish.budget_allows()
    tinyfish.budget_record()
    assert tinyfish.budget_allows()
    tinyfish.budget_record()
    assert not tinyfish.budget_allows()