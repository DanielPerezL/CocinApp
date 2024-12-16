import requests
import json
import os

# URL de la API
DOMINIO = "http://localhost:5000"
LOGOUT = DOMINIO + "/api/users/logout"
LOGIN = DOMINIO + "/api/users/login"
UPLOAD_IMAGE = DOMINIO + "/api/images"
UPLOAD_RECIPE = DOMINIO + "/api/recipes"
ADMIN = {
    "email": "Cocinapp",
    "password": "admin1"
}

def sendPost(url, data=None, files=None):
    req = requests.Request("POST", url, json=data, files=files)
    prepared = session.prepare_request(req)
    response = session.send(prepared)
    if response.status_code < 200 and response.status_code >= 300 :
        print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    response_data = response.json()
    return response_data

# Función para subir la imagen y obtener la URL absoluta
def upload_image_and_get_url(image_path):
    # Extrae el nombre del archivo de la ruta completa
    filename = os.path.basename(image_path)
    
    # Envía la solicitud correctamente
    with open(image_path, 'rb') as f:
        files = {'image': (filename, f)}
        response_data = sendPost(UPLOAD_IMAGE, files=files)
    
    return response_data['filename']

def uploadRecipe(recipe):
    images_sended = []
    for image_path in recipe["images"]:
        image_url = upload_image_and_get_url(image_path)
        images_sended.append(image_url)

    recipe["images"] = images_sended
    sendPost(UPLOAD_RECIPE, data=recipe)  # Ahora enviamos los datos de la receta

if __name__ == "__main__":
    session = requests.Session()
    sendPost(LOGIN, ADMIN)  # Inicia sesión

    try:
        with open('recetas.json', 'r') as file:
            recipes = json.load(file)
    except:
        exit()

    for recipe in recipes:
        uploadRecipe(recipe)

    sendPost(LOGOUT)  # Cierra sesión
    print("fin.")