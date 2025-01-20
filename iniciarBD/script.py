import requests
import json
import os

# URL de la API
DOMINIO = "http://localhost:5000"
LOGOUT = DOMINIO + "/api/users/logout"
LOGIN = DOMINIO + "/api/users/login"
UPLOAD_IMAGE = DOMINIO + "/api/images"
UPLOAD_RECIPE = DOMINIO + "/api/recipes"
UPLOAD_INGREDIENTS = DOMINIO + "/api/recipe/ingredients"  # Endpoint para ingredientes
GET_INGREDIENTS = DOMINIO + "/api/recipe/ingredients"  # Endpoint para obtener los ingredientes
ADMIN = {
    "email": "Cocinapp",
    "password": "admin1"
}

def sendPost(url, data=None, files=None):
    req = requests.Request("POST", url, json=data, files=files)
    prepared = session.prepare_request(req)
    response = session.send(prepared)
    if response.status_code < 200 or response.status_code >= 300:
        print(f"Error al enviar datos a {url}. Status code: {response.status_code}")
        print("Error:", response.text)
        return None
    return response.json()

def sendGet(url):
    req = requests.Request("GET", url)
    prepared = session.prepare_request(req)
    response = session.send(prepared)
    if response.status_code < 200 or response.status_code >= 300:
        print(f"Error al obtener datos de {url}. Status code: {response.status_code}")
        print("Error:", response.text)
        return None
    return response.json()

# Función para subir la imagen y obtener la URL absoluta
def upload_image_and_get_url(image_path):
    # Extrae el nombre del archivo de la ruta completa
    filename = os.path.basename(image_path)
    
    # Envía la solicitud correctamente
    with open(image_path, 'rb') as f:
        files = {'image': (filename, f)}
        response_data = sendPost(UPLOAD_IMAGE, files=files)
        if response_data is None:
            raise Exception(f"Error al subir la imagen: {image_path}")
    
    return response_data['filename']

# Función para cargar ingredientes desde un archivo JSON
def uploadIngredients(ingredients_file):
    try:
        with open(ingredients_file, 'r') as file:
            ingredients = json.load(file)
    except Exception as e:
        print(f"Error al leer el archivo de ingredientes: {e}")
        return

    print(f"Subiendo {len(ingredients)} ingredientes...")

    response = sendPost(UPLOAD_INGREDIENTS, data=ingredients)
    if response is not None:
        print("Ingredientes subidos correctamente.")
    else:
        print("Error al subir los ingredientes.")

# Función para obtener los IDs de los ingredientes
def get_ingredient_ids():
    ingredients_data = sendGet(GET_INGREDIENTS)
    if ingredients_data is not None:
        return {ingredient["name"]: ingredient["id"] for ingredient in ingredients_data}
    else:
        return {}

# Función para cargar recetas
def uploadRecipe(recipe, ingredient_id_map):
    # Mapear los nombres de los ingredientes a sus respectivos IDs
    mapped_ingredients = []
    for ingredient in recipe["ingredients"]:
        name = ingredient["name"]
        amount = ingredient["amount"]
        ingredient_id = ingredient_id_map.get(name)
        
        if ingredient_id:
            mapped_ingredients.append({"id": ingredient_id, "amount": amount})
        else:
            print(f"Ingrediente no encontrado: {name}")

    # Sustituir los ingredientes mapeados en la receta
    recipe["ingredients"] = mapped_ingredients

    # Subir las imágenes
    images_sended = []
    for image_path in recipe["images"]:
        image_url = upload_image_and_get_url(image_path)
        images_sended.append(image_url)

    recipe["images"] = images_sended
    sendPost(UPLOAD_RECIPE, data=recipe)  # Ahora enviamos los datos de la receta

if __name__ == "__main__":
    session = requests.Session()
    sendPost(LOGIN, ADMIN)  # Inicia sesión

    # Subir ingredientes
    print("Subiendo ingredientes...")
    uploadIngredients('ingredientes.json')  # Archivo con los ingredientes

    # Obtener los IDs de los ingredientes
    print("Obteniendo IDs de ingredientes...")
    ingredient_id_map = get_ingredient_ids()
    print(ingredient_id_map)

    # Subir recetas
    print("Subiendo recetas...")
    try:
        with open('recetas.json', 'r') as file:
            recipes = json.load(file)
    except Exception as e:
        print(f"Error al leer el archivo de recetas: {e}")
        exit()

    for recipe in recipes:
        uploadRecipe(recipe, ingredient_id_map)

    sendPost(LOGOUT)  # Cierra sesión
    print("Fin.")
