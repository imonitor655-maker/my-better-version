import os
import stripe

stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')

# In production, set these to your actual URLs
DOMAIN = os.getenv('DOMAIN', 'http://localhost:5000')

PLANS = {
    'pro': {
        'price_id': os.getenv('STRIPE_PRO_PRICE_ID', ''),
        'amount': 900,  # $9.00 in cents
    },
    'lifetime': {
        'price_id': os.getenv('STRIPE_LIFETIME_PRICE_ID', ''),
        'amount': 2900,  # $29.00 in cents
    },
}


def create_checkout_session(plan):
    """Create a Stripe checkout session for the selected plan."""
    
    if not stripe.api_key:
        return {
            'error': 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env'
        }
    
    config = PLANS.get(plan)
    if not config:
        return {'error': f'Invalid plan: {plan}'}
    
    # If price_id is set in Stripe dashboard, use it
    if config['price_id']:
        params = {
            'payment_method_types': ['card'],
            'line_items': [{'price': config['price_id'], 'quantity': 1}],
            'mode': 'payment',
            'success_url': f'{DOMAIN}/success',
            'cancel_url': f'{DOMAIN}/pricing',
        }
    else:
        # Create one-time payment without a price ID
        params = {
            'payment_method_types': ['card'],
            'line_items': [{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'My Better Version — {"Pro Monthly" if plan == "pro" else "Lifetime Access"}',
                        'description': 'AI-powered resume builder with unlimited resumes, all templates, and cover letter generation.',
                    },
                    'unit_amount': config['amount'],
                },
                'quantity': 1,
            }],
            'mode': 'payment',
            'success_url': f'{DOMAIN}/success',
            'cancel_url': f'{DOMAIN}/pricing',
        }
    
    session = stripe.checkout.Session.create(**params)
    
    return {
        'url': session.url,
        'session_id': session.id,
    }


def verify_webhook(payload, sig_header):
    """Verify and process a Stripe webhook."""
    
    if not STRIPE_WEBHOOK_SECRET:
        raise ValueError('Stripe webhook secret not configured')
    
    event = stripe.Webhook.construct_event(
        payload, sig_header, STRIPE_WEBHOOK_SECRET
    )
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # TODO: Activate user's premium plan in your database
        print(f"Payment completed: {session.get('customer_details', {}).get('email', 'unknown')}")
    
    return event
