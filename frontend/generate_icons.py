#!/usr/bin/env python3
"""
Script pour générer les icônes PWA de différentes tailles pour Hedera AgriFund
Utilise PIL (Pillow) pour redimensionner les icônes
"""

import os
from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO

def create_icon_png(size, output_path):
    """Crée une icône PNG de la taille spécifiée"""

    # Créer une nouvelle image avec fond transparent
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Couleurs
    primary_green = (76, 175, 80, 255)  # #4CAF50
    dark_green = (46, 125, 50, 255)     # #2E7D32
    light_green = (139, 195, 74, 255)   # #8BC34A
    yellow = (255, 193, 7, 255)         # #FFC107
    white = (255, 255, 255, 255)

    # Calculer les dimensions en fonction de la taille
    center = size // 2
    radius = int(size * 0.47)  # 47% du rayon pour laisser de la marge

    # Fond circulaire
    draw.ellipse([center - radius, center - radius, center + radius, center + radius],
                 fill=primary_green, outline=dark_green, width=max(1, size // 64))

    # Tige principale
    stem_width = max(2, size // 64)
    stem_height = int(size * 0.3)
    stem_x = center - stem_width // 2
    stem_y = center - stem_height // 2
    draw.rectangle([stem_x, stem_y, stem_x + stem_width, stem_y + stem_height],
                   fill=yellow)

    # Feuilles (ellipses simplifiées)
    leaf_width = max(4, size // 25)
    leaf_height = max(2, size // 64)

    # Feuilles gauche et droite
    for i, (offset_x, offset_y, angle) in enumerate([(-leaf_width, -size//8, 0),
                                                     (leaf_width, -size//8, 0),
                                                     (-leaf_width*1.2, size//16, 0),
                                                     (leaf_width*1.2, size//16, 0)]):
        leaf_x = center + int(offset_x) - leaf_width // 2
        leaf_y = center + int(offset_y) - leaf_height // 2
        color = light_green if i < 2 else (104, 159, 56, 255)  # Couleur plus foncée pour les feuilles du bas
        draw.ellipse([leaf_x, leaf_y, leaf_x + leaf_width, leaf_y + leaf_height], fill=color)

    # Épi de grain (ellipse en haut)
    grain_width = max(3, size // 40)
    grain_height = max(6, size // 25)
    grain_x = center - grain_width // 2
    grain_y = center - stem_height // 2 - grain_height
    draw.ellipse([grain_x, grain_y, grain_x + grain_width, grain_y + grain_height], fill=yellow)

    # Petits grains
    grain_size = max(1, size // 128)
    for offset in [-grain_size, 0, grain_size]:
        draw.ellipse([center + offset - grain_size//2, grain_y + grain_height//3 - grain_size//2,
                     center + offset + grain_size//2, grain_y + grain_height//3 + grain_size//2],
                    fill=(255, 143, 0, 255))

    # Texte "AF" pour les grandes tailles
    if size >= 128:
        try:
            # Essayer de charger une police système
            font_size = max(12, size // 12)
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()

            # Calculer la position du texte
            text = "AF"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            text_x = center - text_width // 2
            text_y = center + int(size * 0.25) - text_height // 2

            draw.text((text_x, text_y), text, fill=white, font=font)
        except Exception as e:
            print(f"Impossible de charger la police pour la taille {size}: {e}")

    # Sauvegarder l'image
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Icône {size}x{size} créée: {output_path}")

def create_all_icons():
    """Crée toutes les icônes PWA nécessaires"""

    # Tailles d'icônes requises pour PWA
    sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

    base_dir = "assets/icons"

    print("🎨 Génération des icônes PWA pour Hedera AgriFund...")
    print("=" * 50)

    for size in sizes:
        output_path = os.path.join(base_dir, f"icon-{size}x{size}.png")
        create_icon_png(size, output_path)

    # Créer aussi des icônes pour les raccourcis
    shortcut_icons = {
        "shortcut-tokenize.png": "🌾",
        "shortcut-loan.png": "💰",
        "shortcut-dashboard.png": "📊"
    }

    print("\n🔗 Génération des icônes de raccourcis...")
    for filename, emoji in shortcut_icons.items():
        create_shortcut_icon(96, os.path.join(base_dir, filename), emoji)

    print(f"\n✅ Toutes les icônes ont été générées dans {base_dir}/")
    print(f"📱 Votre PWA est maintenant prête avec {len(sizes) + len(shortcut_icons)} icônes!")

def create_shortcut_icon(size, output_path, emoji_text):
    """Crée une icône de raccourci avec emoji"""

    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fond circulaire
    center = size // 2
    radius = int(size * 0.47)
    primary_green = (76, 175, 80, 255)

    draw.ellipse([center - radius, center - radius, center + radius, center + radius],
                 fill=primary_green)

    # Texte emoji/symbole
    try:
        font_size = size // 2
        try:
            font = ImageFont.truetype("seguiemj.ttf", font_size)  # Emoji font on Windows
        except:
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", font_size)
            except:
                font = ImageFont.load_default()

        # Centrer le texte
        bbox = draw.textbbox((0, 0), emoji_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        text_x = center - text_width // 2
        text_y = center - text_height // 2

        draw.text((text_x, text_y), emoji_text, fill=(255, 255, 255, 255), font=font)
    except Exception as e:
        print(f"Impossible de charger l'emoji pour {output_path}: {e}")
        # Fallback: dessiner un cercle simple
        draw.ellipse([center - size//6, center - size//6, center + size//6, center + size//6],
                     fill=(255, 255, 255, 255))

    img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Icône raccourci créée: {output_path}")

if __name__ == "__main__":
    try:
        create_all_icons()
    except ImportError:
        print("❌ PIL (Pillow) n'est pas installé.")
        print("📦 Installez-le avec: pip install Pillow")
        print("\nAlternativement, vous pouvez:")
        print("1. Utiliser un générateur d'icônes en ligne comme https://realfavicongenerator.net/")
        print("2. Créer manuellement les icônes aux tailles requises:")
        print("   16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512")
    except Exception as e:
        print(f"❌ Erreur lors de la génération des icônes: {e}")
        print("💡 Vérifiez que vous êtes dans le bon répertoire (frontend/)")
