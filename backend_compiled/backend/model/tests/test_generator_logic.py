import json
import pytest
from google.api_core import exceptions as google_exceptions
import app.config as config_module
import app.generator as gen

@pytest.fixture
def temp_corpus(tmp_path, monkeypatch):
    # write a single JSONL record
    sample = {"class":"10","subject":"Math","chapter":"Foo","content":"CONTENT"}
    f = tmp_path/"corpus.jsonl"
    f.write_text(json.dumps(sample) + "\n")
    # override config.input_file
    monkeypatch.setitem(config_module.config.settings, "input_file", str(f))
    # clear any previous cache
    gen.corpus_cache = None
    return f

def test_get_chapter_content(temp_corpus):
    gen.load_corpus_once()
    assert gen.get_chapter_content("10","math","Foo") == "CONTENT"

class DummyModel:
    def __init__(self, name):
        self.name = name
    def generate_content(self, prompt, stream=False):
        if self.name == "pro":
            raise google_exceptions.ResourceExhausted("rate limit")
        return type("Resp", (), {"text": "OK"})

@pytest.fixture(autouse=True)
def patch_genai(monkeypatch):
    # stub out genai.GenerativeModel
    monkeypatch.setattr(gen, "genai", type("m", (), {
        "configure": lambda api_key: None,
        "GenerativeModel": lambda name: DummyModel(name)
    }))
    return gen

def test_generate_content_with_fallback():
    # configure pro → flash fallback
    config_module.config.settings["pro_model"] = "pro"
    config_module.config.settings["flash_model"] = "flash"
    config_module.config.settings["max_retries"] = 1

    resp, model_used = gen.generate_content_with_fallback("prompt", stream=False)
    assert resp.text == "OK"
    assert model_used == "flash"
