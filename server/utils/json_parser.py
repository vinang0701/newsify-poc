import json
import csv
import random

# Your target headers
headers = [
    "inst_id",
    "author",
    "created_at",
    "title",
    "status",
    "description",
    "content",
    "image_url",
    "community_id",
]

users = [
    "033ac589-92cd-40d4-acc0-9ac17e0c7bc3",
    "0c8806cb-ffe0-436c-b55d-c2653f96d8ae",
    "1cbc8544-f3de-40a7-a7a2-280f9fa77a15",
    "30107477-e676-441c-856d-335be2578645",
    "3fb94cba-3081-4531-bd3f-845b1a3903aa",
    "4813d507-9b97-4bb7-bee4-39ec47070889",
    "61bb59ec-65df-463c-ba77-fef6d316265e",
    "62b3205f-5960-4ab3-bb46-7d86949cf6f1",
    "67074da7-92d3-4de9-9f43-64ff37deea95",
    "70e4b8cc-03b9-4ced-8dfc-c152bcfc51b0",
    "79b23425-5585-43bc-ad74-b12cdb0d24cb",
    "7c02050f-c6ef-4654-b29e-6650f13e4a39",
    "846ed722-e61b-437d-a42b-4fbdb48c00d6",
    "b1d905c2-e79e-4f82-87fa-3805a223f80e",
    "ba32963b-2231-4615-ac2e-7738251c6142",
    "c8ccef8e-3924-49ea-a0e8-ed6ea60b1891",
    "d35596b5-4629-4015-89b2-844d46f6e7b0",
    "dcc73f33-5915-43ac-90a5-7ca83f9d6aa9",
    "e1bb5c8e-491e-4eb2-a856-b23d2ca48ed6",
    "f8a4e876-07ea-45ec-a39b-eefea2566648",
    "f8afcfc5-6d87-4e54-91d4-06c5678c6752",
]


def parse_news_json(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()

        for index, item in enumerate(data):
            # Mapping JSON keys to CSV headers

            row = {
                "inst_id": "391848ae-e6c6-43ec-a34c-e6ce06f0d842",  # Placeholder
                "author": random.choice(users),
                "created_at": item.get(
                    "publishedAt", ""
                ),  # Mapping publishedAt -> created_at
                "title": item.get("title", ""),
                "status": "published",  # Default status
                "description": item.get("description", ""),
                "content": json.dumps({"text": item.get("content", "")}),
                "image_url": item.get("image_url", ""),
                "community_id": "",  # Placeholder
            }
            writer.writerow(row)


if __name__ == "__main__":
    parse_news_json("news.json", "news.csv")
    print("Conversion complete: news.csv created.")
