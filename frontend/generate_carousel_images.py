#!/usr/bin/env python3
"""
Générateur d'images pour le carousel Success Stories
Crée des images de placeholder pour les case studies
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_case_study_image(title, subtitle, color_scheme, filename):
    """Crée une image pour une case study"""
    width, height = 800, 600

    # Couleurs selon le schéma
    if color_scheme == "coffee":
        bg_color = "#8B4513"  # Marron café
        accent_color = "#00D4AA"  # Vert Hedera
        text_color = "#FFFFFF"
    elif color_scheme == "rice":
        bg_color = "#228B22"  # Vert forêt
        accent_color = "#FFD700"  # Or
        text_color = "#FFFFFF"

    # Créer l'image
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Essayer d'utiliser une police plus jolie
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        detail_font = ImageFont.truetype("arial.ttf", 30)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        detail_font = ImageFont.load_default()

    # Dessiner le fond avec gradient simulé
    for y in range(height):
        alpha = y / height
        if color_scheme == "coffee":
            r = int(139 * (1 - alpha * 0.3))
            g = int(69 * (1 - alpha * 0.3))
            b = int(19 * (1 - alpha * 0.3))
        else:
            r = int(34 * (1 - alpha * 0.3))
            g = int(139 * (1 - alpha * 0.3))
            b = int(34 * (1 - alpha * 0.3))

        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Dessiner des éléments décoratifs
    if color_scheme == "coffee":
        # Dessiner des grains de café stylisés
        for i in range(8):
            x = 50 + i * 90
            y = 50
            draw.ellipse([x, y, x+40, y+60], fill=accent_color, outline=text_color, width=2)
            draw.ellipse([x+10, y+15, x+30, y+45], fill=bg_color)
    else:
        # Dessiner des tiges de riz stylisées
        for i in range(6):
            x = 80 + i * 120
            draw.line([(x, 50), (x, 150)], fill=accent_color, width=8)
            for j in range(5):
                y = 60 + j * 20
                draw.ellipse([x-15, y, x+15, y+10], fill=accent_color)

    # Ajouter un overlay semi-transparent pour le texte
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 120))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)

    # Dessiner le titre
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    draw.text((title_x, 250), title, fill=text_color, font=title_font)

    # Dessiner le sous-titre
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    draw.text((subtitle_x, 330), subtitle, fill=accent_color, font=subtitle_font)

    # Ajouter "Hedera AgriFund" en bas
    footer_text = "Powered by Hedera AgriFund"
    footer_bbox = draw.textbbox((0, 0), footer_text, font=detail_font)
    footer_width = footer_bbox[2] - footer_bbox[0]
    footer_x = (width - footer_width) // 2
    draw.text((footer_x, 520), footer_text, fill=accent_color, font=detail_font)

    # Sauvegarder l'image
    img.save(filename, 'JPEG', quality=90)
    print(f"Image créée: {filename}")

def main():
    """Générer toutes les images du carousel"""
    output_dir = "I:/hedera_kackav2/frontend/assets/screenshots"

    # S'assurer que le dossier existe
    os.makedirs(output_dir, exist_ok=True)

    # Créer les images
    case_studies = [
        {
            "title": "Coffee Cooperative",
            "subtitle": "Kenya Success Story",
            "color_scheme": "coffee",
            "filename": os.path.join(output_dir, "case-study-1.jpg")
        },
        {
            "title": "Rice Farmers",
            "subtitle": "Vietnam Innovation",
            "color_scheme": "rice",
            "filename": os.path.join(output_dir, "case-study-2.jpg")
        }
    ]

    for study in case_studies:
        create_case_study_image(
            study["title"],
            study["subtitle"],
            study["color_scheme"],
            study["filename"]
        )

    print("✅ Toutes les images du carousel ont été générées!")

if __name__ == "__main__":
    main()
