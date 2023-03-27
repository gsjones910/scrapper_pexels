import json
import requests
from PIL import Image
import io
import os

dateList = [
    {
        "year": "2016",
        "month": ["02", "03", "04", "05", "06",
                "07", "08", "09", "10", "11", "12"]
    },
    {
        "year": "2017",
        "month": ["01", "02", "03", "04", "05", "06",
                "07", "08", "09", "10", "11", "12"]
    },
    {
        "year": "2018",
        "month": ["01", "02", "03", "04", "05", "06",
                "07", "08", "09", "10", "11", "12"]
    },
    {
        "year": "2019",
        "month": ["01", "02", "03", "04", "05", "06",
                "07", "08", "09", "10", "11", "12"]
    },
    {
        "year": "2020",
        "month": ["01", "02", "03", "04", "05", "06",
                "07", "08", "09", "10", "11", "12"]
    },
    {
        "year": "2021",
        "month": ["01", "02", "03", "04", "05", "06",
                "07", "08", "09", "10", "11", "12"]
    },
    {
        "year": "2022",
        "month": ["01", "02", "03", "04", "05", "06",
                "07", "08", "09", "10", "11", "12"]
    },
    {
        "year": "2023",
        "month": ["01", "02"]
    },
]

for date in dateList:
    year = date["year"]
    months = date["month"]
    if not os.path.exists('./images/' + year):
        os.mkdir('./images/' + year)
        
    for month in months:
        # Load JSON data from file
        with open('./urls/' + year + '_' + month + '.json', 'r') as f:
            data = json.load(f)

        count = 0

        Image_Folder = './images/' + year + '/' + month
        if not os.path.exists(Image_Folder):
            os.mkdir(Image_Folder)

        for image_url in data:
            # Download image
            response = requests.get(image_url)

            # Open image file and save it
            img = Image.open(io.BytesIO(response.content))
            file_path = Image_Folder + '/' + str(count) + '.jpg'
            img.save(file_path)
            count = count + 1
