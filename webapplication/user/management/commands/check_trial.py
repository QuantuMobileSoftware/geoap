import logging
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from user.models import User

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Check if the trial period has ended"

    def handle(self, *args, **options):
        logger.info("starting to search users with expired trials")
        thirty_days_ago = timezone.now() - timedelta(days=settings.TRIAL_PERIOD_IN_DAYS)
        users_with_expired_trials = User.objects.filter(
            trial_started_at__isnull=False, trial_started_at__lte=thirty_days_ago
        )
        logger.info(f"found {len(users_with_expired_trials)} users with expired trials")
        for user in users_with_expired_trials:
            user.finish_trial()
            logger.info(f"finished trial period for user: {user.username}")
        logger.info("finished to search users with expired trials")
