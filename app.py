import json
import random
import re
import threading
import time

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
try:
    app.json.ensure_ascii = False
except AttributeError:
    pass

visited_event = threading.Event()

# Загружаем обширную базу обесцениваний из JSON
with open("negations.json", encoding="utf-8") as f:
    DATA = json.load(f)


def normalize(text: str) -> set[str]:
    lowered = text.lower()
    cleaned = re.sub(r"[^\w\s]", " ", lowered)
    return set(cleaned.split())


def pick_reason(idea: str) -> tuple[str, str]:
    words = normalize(idea)
    matched = []

    for category in DATA["categories"]:
        score = sum(1 for kw in category["keywords"] if kw.lower() in words)
        if score:
            matched.append((score, category))

    if matched:
        matched.sort(key=lambda x: x[0], reverse=True)
        category = matched[0][1]
    else:
        category = DATA["fallback"]

    def take(slot: str) -> str:
        return random.choice(category[slot])

    message = " ".join([take("intro"), take("reasons"), take("consequences"), take("finale")])
    return message, category["name"]


@app.route("/")
def index():
    visited_event.set()
    return render_template("index.html")


@app.route("/api/respond", methods=["POST"])
def respond():
    data = request.get_json(silent=True) or {}
    idea = data.get("idea", "").strip()
    if not idea:
        idea = "ничего"
    message, category = pick_reason(idea)
    return jsonify({"message": message, "idea": idea, "category": category})


@app.route("/api/status")
def status():
    return jsonify({"visited": visited_event.is_set()})


def announce_visit():
    visited_event.wait()
    time.sleep(0.3)
    print("\n[+] Пользователь открыл сайт: http://127.0.0.1:5000")
    print("[+] Приложение работает. Можно вбивать идеи.\n")


if __name__ == "__main__":
    threading.Thread(target=announce_visit, daemon=True).start()
    print("* Запускаю сервер на http://127.0.0.1:5000")
    print("* Откройте этот адрес в браузере...")
    app.run(host="127.0.0.1", port=5000, debug=False)
