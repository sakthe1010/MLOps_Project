import os
import yaml
from dotenv import load_dotenv

class Config:
    def __init__(self, config_path='config.yml'):
        load_dotenv()
        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Config file {config_path} not found. Please create it.")
        with open(config_path, 'r') as f:
            self.settings = yaml.safe_load(f)

    @property
    def api_key(self):
        env_var = self.settings.get("api_key_env_var")
        if env_var is None:
            raise ValueError("api_key_env_var not set in config.yml")
        return os.getenv(env_var)

    def get(self, key):
        return self.settings.get(key)

config = Config()
