#!/usr/bin/env python3
"""
Script pour créer des captures d'écran de démonstration pour le PWA Hedera AgriFund
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_demo_screenshot(width, height, output_path, content_type="desktop"):
    """Crée une capture d'écran de démonstration"""

    # Créer l'image
    img = Image.new('RGB', (width, height), (248, 249, 250))  # Fond gris clair
    draw = ImageDraw.Draw(img)

    # Couleurs
    primary_green = (76, 175, 80)
    dark_green = (46, 125, 50)
    white = (255, 255, 255)
    text_color = (33, 37, 41)
    border_color = (224, 224, 224)

    if content_type == "desktop":
        create_desktop_dashboard(img, draw, primary_green, white, text_color, border_color)
    elif content_type == "mobile":
        create_mobile_onboarding(img, draw, primary_green, white, text_color, border_color)

    # Sauvegarder
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Capture d'écran créée: {output_path}")

def create_desktop_dashboard(img, draw, primary_green, white, text_color, border_color):
    """Crée une maquette du dashboard desktop"""
    width, height = img.size

    # Header/Navigation
    draw.rectangle([0, 0, width, 80], fill=white, outline=border_color)

    # Logo et titre
    draw.ellipse([20, 20, 60, 60], fill=primary_green)
    try:
        font_title = ImageFont.truetype("arial.ttf", 24)
        font_nav = ImageFont.truetype("arial.ttf", 16)
        font_card = ImageFont.truetype("arial.ttf", 14)
        font_small = ImageFont.truetype("arial.ttf", 12)
    except:
        font_title = ImageFont.load_default()
        font_nav = ImageFont.load_default()
        font_card = ImageFont.load_default()
        font_small = ImageFont.load_default()

    draw.text((80, 35), "Hedera AgriFund", fill=text_color, font=font_title)

    # Navigation items
    nav_items = ["Dashboard", "Prêts", "Reçus Numériques", "Analytics"]
    nav_x = 300
    for item in nav_items:
        draw.text((nav_x, 35), item, fill=text_color, font=font_nav)
        nav_x += 150

    # Connect Wallet button
    btn_width, btn_height = 160, 40
    btn_x = width - btn_width - 20
    btn_y = 20
    draw.rectangle([btn_x, btn_y, btn_x + btn_width, btn_y + btn_height],
                   fill=primary_green, outline=primary_green)
    draw.text((btn_x + 25, btn_y + 12), "Connecter Wallet", fill=white, font=font_nav)

    # Main content area
    content_y = 100

    # Welcome message
    draw.text((40, content_y), "Bonjour, Jean Agriculteur !", fill=text_color, font=font_title)
    content_y += 60

    # Stats cards
    card_width = 280
    card_height = 120
    card_spacing = 20
    cards_data = [
        ("Valeur totale", "$15,430", primary_green),
        ("Prêts actifs", "2", (255, 152, 0)),
        ("Prochaine échéance", "15 Mars", (244, 67, 54))
    ]

    card_x = 40
    for title, value, color in cards_data:
        # Card background
        draw.rectangle([card_x, content_y, card_x + card_width, content_y + card_height],
                       fill=white, outline=border_color, width=2)

        # Card content
        draw.text((card_x + 20, content_y + 20), title, fill=text_color, font=font_card)
        draw.text((card_x + 20, content_y + 50), value, fill=color, font=font_title)

        card_x += card_width + card_spacing

    content_y += card_height + 40

    # Quick actions section
    draw.text((40, content_y), "Actions rapides", fill=text_color, font=font_title)
    content_y += 40

    # Action buttons
    actions = ["Créer reçu numérique", "Demander prêt", "Voir portfolio"]
    btn_width = 200
    btn_height = 50
    btn_x = 40

    for action in actions:
        draw.rectangle([btn_x, content_y, btn_x + btn_width, content_y + btn_height],
                       fill=primary_green, outline=primary_green)
        draw.text((btn_x + 20, content_y + 18), action, fill=white, font=font_nav)
        btn_x += btn_width + 20

    content_y += btn_height + 40

    # Recent activity section
    draw.text((40, content_y), "Activité récente", fill=text_color, font=font_title)
    content_y += 40

    # Activity items
    activities = [
        "🌾 Reçu numérique créé - 500kg Maïs",
        "💰 Prêt financé - $3,000 reçus",
        "📊 Prix maïs mis à jour - $3.20/kg"
    ]

    for activity in activities:
        draw.rectangle([40, content_y, width - 40, content_y + 40],
                       fill=white, outline=border_color)
        draw.text((60, content_y + 12), activity, fill=text_color, font=font_card)
        content_y += 50

def create_mobile_onboarding(img, draw, primary_green, white, text_color, border_color):
    """Crée une maquette de l'onboarding mobile"""
    width, height = img.size

    # Header
    draw.rectangle([0, 0, width, 100], fill=primary_green)

    try:
        font_title = ImageFont.truetype("arial.ttf", 20)
        font_subtitle = ImageFont.truetype("arial.ttf", 16)
        font_text = ImageFont.truetype("arial.ttf", 14)
    except:
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
        font_text = ImageFont.load_default()

    # Progress bar
    progress_width = width - 80
    progress_x = 40
    progress_y = 30
    draw.rectangle([progress_x, progress_y, progress_x + progress_width, progress_y + 8],
                   fill=(255, 255, 255, 100), outline=None)
    draw.rectangle([progress_x, progress_y, progress_x + progress_width * 0.66, progress_y + 8],
                   fill=white, outline=None)

    draw.text((progress_x, progress_y + 20), "Étape 2 sur 3", fill=white, font=font_subtitle)

    # Main content
    content_y = 130

    # Centered icon (simplified)
    icon_size = 80
    icon_x = (width - icon_size) // 2
    draw.ellipse([icon_x, content_y, icon_x + icon_size, content_y + icon_size],
                 fill=primary_green)
    draw.text((icon_x + 35, content_y + 35), "🚜", fill=white, font=font_title)

    content_y += icon_size + 40

    # Title
    title = "Qui êtes-vous ?"
    title_width = draw.textlength(title, font=font_title)
    draw.text(((width - title_width) // 2, content_y), title, fill=text_color, font=font_title)
    content_y += 60

    # Role options
    option_height = 100
    option_margin = 30

    # Farmer option (selected)
    draw.rectangle([option_margin, content_y, width - option_margin, content_y + option_height],
                   fill=white, outline=primary_green, width=3)
    draw.text((option_margin + 20, content_y + 20), "🚜 Agriculteur", fill=text_color, font=font_subtitle)
    draw.text((option_margin + 20, content_y + 45), "Je cultive et cherche du financement",
              fill=text_color, font=font_text)

    # Check mark for selected option
    draw.ellipse([width - 60, content_y + 10, width - 40, content_y + 30], fill=primary_green)
    draw.text((width - 55, content_y + 15), "✓", fill=white, font=font_text)

    content_y += option_height + 20

    # Lender option
    draw.rectangle([option_margin, content_y, width - option_margin, content_y + option_height],
                   fill=white, outline=border_color, width=2)
    draw.text((option_margin + 20, content_y + 20), "💰 Investisseur", fill=text_color, font=font_subtitle)
    draw.text((option_margin + 20, content_y + 45), "Je veux investir dans l'agriculture",
              fill=text_color, font=font_text)

    content_y += option_height + 60

    # Bottom buttons
    btn_height = 50
    btn_margin = 30

    # Previous button
    draw.rectangle([btn_margin, content_y, (width // 2) - 10, content_y + btn_height],
                   fill=white, outline=border_color, width=2)
    draw.text((btn_margin + 40, content_y + 18), "Précédent", fill=text_color, font=font_subtitle)

    # Next button
    draw.rectangle([(width // 2) + 10, content_y, width - btn_margin, content_y + btn_height],
                   fill=primary_green, outline=primary_green)
    draw.text(((width // 2) + 50, content_y + 18), "Suivant", fill=white, font=font_subtitle)

def create_demo_screenshots():
    """Crée toutes les captures d'écran de démonstration"""

    print("📸 Génération des captures d'écran de démonstration...")
    print("=" * 50)

    # Desktop dashboard
    create_demo_screenshot(1280, 720, "assets/screenshots/desktop-dashboard.png", "desktop")

    # Mobile onboarding
    create_demo_screenshot(390, 844, "assets/screenshots/mobile-onboarding.png", "mobile")

    print(f"\n✅ Captures d'écran créées dans assets/screenshots/")
    print("🎨 Ces maquettes donnent un aperçu de votre app dans les stores!")

if __name__ == "__main__":
    try:
        create_demo_screenshots()
    except Exception as e:
        print(f"❌ Erreur lors de la création des captures d'écran: {e}")
        print("💡 Les captures d'écran sont optionnelles pour le PWA")
