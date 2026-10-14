import logging
import sys

from pythonjsonlogger.json import JsonFormatter

from app.core.config import Settings
from app.middleware.request_id import get_request_id


class RequestIdFilter(logging.Filter):
    def __init__(self, settings: Settings) -> None:
        super().__init__()
        self.settings = settings

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id()
        record.service_name = self.settings.service_name
        record.service_version = self.settings.version
        record.environment = self.settings.environment
        return True


def configure_logging(settings: Settings) -> logging.Logger:
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIdFilter(settings))

    if settings.log_format == "json":
        handler.setFormatter(
            JsonFormatter(
                "%(asctime)s %(levelname)s %(name)s %(message)s "
                "%(service_name)s %(service_version)s %(environment)s "
                "%(request_id)s"
            )
        )
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s [%(name)s] %(request_id)s %(message)s"
            )
        )

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(settings.log_level)

    return logging.getLogger("app")
