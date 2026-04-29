import logging

from django.core.exceptions import ObjectDoesNotExist
from django.db.models.signals import post_save
from django.dispatch import receiver

from aoi.models import Request

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Request)
def sync_stones_chunk_status(sender, instance, **kwargs):
    try:
        chunk = instance.stones_chunk
    except ObjectDoesNotExist:
        return

    if instance.calculated:
        new_status = chunk.STATUS_DONE
    elif instance.error:
        new_status = chunk.STATUS_FAILED
    else:
        return

    if chunk.status != new_status:
        chunk.status = new_status
        chunk.save(update_fields=["status"])
        logger.info(f"Chunk pk={chunk.pk} → {new_status} (request pk={instance.pk})")
