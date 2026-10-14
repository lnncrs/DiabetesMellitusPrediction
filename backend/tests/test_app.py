from importlib import import_module

from fastapi import FastAPI

from app.main import create_app


def test_app_package_imports() -> None:
    assert import_module("app") is not None


def test_app_main_module_imports() -> None:
    assert import_module("app.main") is not None


def test_create_app_returns_fastapi_app() -> None:
    assert isinstance(create_app(), FastAPI)
