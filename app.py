
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


# 1. HOME PAGE
@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


# 2. DISCOUNT ENGINE
@app.route("/discount", methods=["POST"])
def discount():
    data = request.get_json(silent=True) or {}

    try:
        total = float(data.get("total", 0))
        customer = str(data.get("customer", "guest")).strip().lower()
        membership_id = str(data.get("membership_id", "") or "").strip()
        season = str(data.get("season", "normal")).strip().lower()
        coupon = str(data.get("coupon", "") or "").strip().upper()
        quantity = int(data.get("quantity", 1))
        first_order = data.get("first_order", False)

        # Validate input
        if total < 0 or quantity < 1:
            return jsonify({
                "success": False,
                "error": "Invalid cart total or quantity."
            }), 400

        if customer not in ["guest", "member", "premium", "vip"]:
            return jsonify({
                "success": False,
                "error": "Invalid customer type."
            }), 400

        if customer != "guest" and not membership_id:
            return jsonify({
                "success": False,
                "error": "Membership ID is required for registered customers."
            }), 400

        if season not in ["normal", "festive", "mega"]:
            return jsonify({
                "success": False,
                "error": "Invalid seasonal offer."
            }), 400

        if not isinstance(first_order, bool):
            return jsonify({
                "success": False,
                "error": "Invalid first-order selection."
            }), 400

        original_total = total
        price = total

        # 3. MEMBERSHIP DISCOUNT
        if customer == "vip":
            member_rate = 15
        elif customer == "premium":
            member_rate = 10
        elif customer == "member":
            member_rate = 5
        else:
            member_rate = 0

        member_discount = price * member_rate / 100
        price -= member_discount

        # 4. CART VALUE DISCOUNT
        if original_total >= 10000:
            cart_rate = 15
        elif original_total >= 5000:
            cart_rate = 10
        elif original_total >= 2000:
            cart_rate = 5
        else:
            cart_rate = 0

        cart_discount = price * cart_rate / 100
        price -= cart_discount

        # 5. SEASONAL DISCOUNT (requires the matching coupon)
        if season == "mega" and coupon == "MEGA20":
            season_rate = 20
        elif season == "festive" and coupon == "FESTIVE10":
            season_rate = 10
        else:
            season_rate = 0

        season_discount = price * season_rate / 100
        price -= season_discount

        # 6. COUPON CODE
        coupon_discount = 0

        if coupon == "":
            coupon_message = (
                "No coupon entered. Checkout can continue normally. "
                "Seasonal discounts require FESTIVE10 or MEGA20."
            )

        elif coupon == "FESTIVE10":
            if season == "festive":
                coupon_message = (
                    "Success! FESTIVE10 unlocked the 10% Festive discount."
                )
            else:
                coupon_message = (
                    "FESTIVE10 applies only when Festive Sale is selected."
                )

        elif coupon == "MEGA20":
            if season == "mega":
                coupon_message = (
                    "Success! MEGA20 unlocked the 20% Mega discount."
                )
            else:
                coupon_message = (
                    "MEGA20 applies only when Mega Sale is selected."
                )

        elif coupon == "SAVE10":
            coupon_discount = price * 10 / 100
            price -= coupon_discount
            coupon_message = (
                "Success! SAVE10 applied. You received 10% extra discount."
            )

        elif coupon == "SMART500" and original_total >= 5000:
            coupon_discount = min(500, price)
            price -= coupon_discount
            coupon_message = (
                "Success! SMART500 applied. You saved Rs. 500."
            )

        elif coupon == "SMART500":
            coupon_message = (
                "SMART500 requires a cart value of Rs. 5000 or more."
            )

        else:
            coupon_message = (
                "Invalid coupon code. No coupon discount was applied. "
                "You can continue checkout."
            )

        # 7. QUANTITY DISCOUNT
        quantity_discount = 0

        if quantity >= 3:
            quantity_discount = min(250, price)
            price -= quantity_discount
            quantity_message = "Rs. 250 quantity discount applied."
        elif quantity >= 2:
            quantity_discount = min(100, price)
            price -= quantity_discount
            quantity_message = "Rs. 100 quantity discount applied."
        else:
            quantity_message = "No quantity discount."

        # 8. FIRST ORDER DISCOUNT
        first_order_discount = 0

        if first_order and customer != "guest":
            first_order_discount = price * 10 / 100
            price -= first_order_discount
            first_order_message = "10% first-order discount applied."
        elif first_order and customer == "guest":
            first_order_message = (
                "First-order discount is available to registered customers."
            )
        else:
            first_order_message = "No first-order discount applied."

        # 9. LIMIT TOTAL DISCOUNT TO RS. 2000
        price = max(price, original_total - 2000, 0)

        # 10. DELIVERY CHARGE
        if customer in ["premium", "vip"] or original_total >= 999:
            delivery = 0
        else:
            delivery = 80

        # 11. FINAL PRICE
        final_price = price + delivery
        total_savings = original_total - price

        return jsonify({
            "success": True,
            "subtotal": round(original_total, 2),
            "membership_discount_rate": member_rate,
            "cart_discount_rate": cart_rate,
            "seasonal_discount_rate": season_rate,
            "membership_discount": round(member_discount, 2),
            "cart_discount": round(cart_discount, 2),
            "seasonal_discount": round(season_discount, 2),
            "coupon_discount": round(coupon_discount, 2),
            "coupon_message": coupon_message,
            "quantity_discount": round(quantity_discount, 2),
            "quantity_message": quantity_message,
            "first_order_discount": round(first_order_discount, 2),
            "first_order_message": first_order_message,
            "savings": round(total_savings, 2),
            "delivery": round(delivery, 2),
            "final_price": round(final_price, 2)
        })

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "error": "Invalid input. Please check your cart details."
        }), 400


# 12. RUN THE WEBSITE
if __name__ == "__main__":
    app.run(debug=True, port=8000)
