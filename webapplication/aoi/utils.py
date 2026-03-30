from decimal import Decimal

from django.db import transaction

from user.models import Transaction


def create_change_transaction(request, processed_area_sq_km):
    """
    Compare processed area with charged area.
    If processed < charged, create a refund transaction for the difference.

    Returns the change Transaction or None.
    """
    request.processed_area_sq_km = processed_area_sq_km
    request.save(update_fields=["processed_area_sq_km"])

    original_transaction = request.transactions.filter(
        completed=True, rolled_back=False, amount__lt=0
    ).first()

    if not original_transaction:
        return None

    charged_area = request.charged_area_sq_km
    if not charged_area or processed_area_sq_km >= charged_area:
        return None

    original_price = abs(original_transaction.amount)
    actual_price = request.component.calculate_request_price(
        area=Decimal(str(processed_area_sq_km)),
        user=request.user,
    )
    change_amount = original_price - actual_price

    if change_amount <= 0:
        return None

    with transaction.atomic():
        change_tx = Transaction.objects.create(
            user=request.user,
            amount=change_amount,
            request=request,
            comment=f"Change: processed area ({processed_area_sq_km:.4f} sq km) "
                    f"less than charged area ({charged_area:.4f} sq km)",
            completed=True,
        )
        request.user.balance += change_amount
        request.user.save(update_fields=["balance"])

    return change_tx
