import json

# Lista de unidades permitidas
VALID_UNITS = ["g", "kg", "ml", "l", "units"]

# Función para cargar el JSON
def load_ingredients(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

# Función para realizar las comprobaciones
def validate_ingredients(ingredients):
    seen_names = set()
    for ingredient in ingredients:
        # Comprobar que no se repite el nombre en inglés
        if ingredient['name_en'] in seen_names:
            print(f"Duplicado encontrado: {ingredient['name_en']}")
        seen_names.add(ingredient['name_en'])

        # Comprobar que el default_unit tiene un valor permitido
        if ingredient['default_unit'] not in VALID_UNITS:
            print(f"Unidad no válida para {ingredient['name_en']}: {ingredient['default_unit']}")

# Ruta del archivo JSON
file_path = "ingredientes.json"

# Cargar los ingredientes y realizar las comprobaciones
ingredients = load_ingredients(file_path)
validate_ingredients(ingredients)

