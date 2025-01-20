import requests
import json
import os

# URL de la API
DOMINIO = "http://localhost:5000"
LOGOUT = DOMINIO + "/api/users/logout"
LOGIN = DOMINIO + "/api/users/login"
INGREDIENTS = DOMINIO + "/api/recipe/ingredients"
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

# Función para cargar ingredientes desde un archivo JSON
def uploadIngredients(ingredients_file):
    try:
        with open(ingredients_file, 'r') as file:
            ingredients = json.load(file)
    except Exception as e:
        print(f"Error al leer el archivo de ingredientes: {e}")
        return

    print(f"Subiendo {len(ingredients)} ingredientes...")

    response = sendPost(INGREDIENTS, data=ingredients)
    print(response)

if __name__ == "__main__":
    session = requests.Session()
    sendPost(LOGIN, ADMIN)  # Inicia sesión

    # Subir ingredientes
    print("Subiendo ingredientes...")
    uploadIngredients('ingredientes.json')  # Archivo con los ingredientes

    sendPost(LOGOUT)  # Cierra sesión
    print("Fin.")
