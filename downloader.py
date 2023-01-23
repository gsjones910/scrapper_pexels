import json
import requests
from dotenv import load_dotenv
from PIL import Image
import io
import os

load_dotenv()
file_name = os.getenv("SEARCH_TITLE")

# Load JSON data from file
with open('./urls/' + file_name + '.json', 'r') as f:
    data = json.load(f)

# Get image URL from JSON data

count = 0
Image_Folder = './images/' + file_name
if not os.path.exists(Image_Folder):
    os.mkdir(Image_Folder)

for image_url in data:
    # Download image
    response = requests.get(image_url)

    # Open image file and save it
    img = Image.open(io.BytesIO(response.content))
    file_path = Image_Folder + '/' + file_name + str(count) + '.jpeg'
    img.save(file_path)
    count = count + 1