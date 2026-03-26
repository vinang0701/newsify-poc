import json
import csv
import random

# Your target headers
headers = ["inst_id", "created_by_user_id", "name", "description", "status"]


def parse_comms_json(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()

        for index, item in enumerate(data):
            # Mapping JSON keys to CSV headers

            row = {
                "inst_id": "391848ae-e6c6-43ec-a34c-e6ce06f0d842",  # Placeholder
                "created_by_user_id": "4813d507-9b97-4bb7-bee4-39ec47070889",
                "name": item.get("name", ""),
                "description": item.get("desc", ""),
                "status": "active",
            }
            writer.writerow(row)


if __name__ == "__main__":
    parse_comms_json("communities.json", "communities.csv")
    print("Conversion complete: communities.csv created.")
