import csv
import random

# Expanded name pools to ensure variety
first_names = [
    "John",
    "Maria",
    "Wei",
    "Siti",
    "David",
    "Nur",
    "Kevin",
    "Sarah",
    "Liam",
    "Chloe",
    "Zoe",
    "Ryan",
    "Amir",
    "Priya",
    "Lucas",
]
last_names = [
    "Doe",
    "Lee",
    "Tan",
    "Ahmad",
    "Smith",
    "Wong",
    "Chen",
    "Gupta",
    "Wilson",
    "Taylor",
    "Lim",
    "Ng",
    "Das",
    "Patel",
    "Jones",
]


def generate_unique_users(filename, target_count=50):
    unique_users = []
    seen_emails = set()  # Track unique emails here

    while len(unique_users) < target_count:
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        full_name = f"{fname} {lname}"

        # Standardize email: remove spaces and lowercase
        email_prefix = full_name.replace(" ", "").lower()
        email = f"{email_prefix}001@sim.edu.sg"

        # Only add if the email hasn't been generated yet
        if email not in seen_emails:
            seen_emails.add(email)
            unique_users.append({"name": full_name, "email": email, "role": "student"})

    # Write to CSV
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "email", "role"])
        writer.writeheader()
        writer.writerows(unique_users)


if __name__ == "__main__":
    generate_unique_users("50_sim_users.csv")
    print(f"Successfully generated 50 unique users in 'unique_sim_users.csv'")
