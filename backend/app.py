from datetime import timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

import firebase_admin 
from firebase_admin import credentials, firestore


app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # Token süresi 1 saat
jwt = JWTManager(app)

# Firebase admin SDK için service account anahtarını kullanarak bağlantı başlatıyoruz
cred = credentials.Certificate("serviceAccountKey.json")  # Bu dosya proje dizininde olmalı
firebase_admin.initialize_app(cred)

db = firestore.client()


# Basit ping testi
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"}), 200

# Basit register (şimdilik veri tabanı yok)
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    # Şimdilik dummy dönüş
    return jsonify({"message": f"{username} registered successfully"}), 200

# Login (dummy token üret)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    # Gerçek kontrol yok, direkt token ver
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200

# Üretim kaydı ekleme (dummy)
@app.route('/add_record', methods=['POST'])
@jwt_required()
def add_record():
    current_user = get_jwt_identity()
    data = request.get_json()

    # Firestore'a kaydet
    doc_ref = db.collection('uretim_kayitlari').document()
    doc_ref.set({
        "user": current_user,
        "parca_ad": data.get("parca_ad"),
        "adet": data.get("adet"),
        "vardiya": data.get("vardiya"),
        "operator": data.get("operator"),
        "makine": data.get("makine"),
        "timestamp": firestore.SERVER_TIMESTAMP
    })

    return jsonify({"message": "Record added to Firestore", "user": current_user, "data": data}), 200


# Kayıtları getirme (dummy)
@app.route('/get_records', methods=['GET'])
@jwt_required()
def get_records():
    records = []
    docs = db.collection('uretim_kayitlari').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).stream()
    for doc in docs:
        records.append(doc.to_dict())
    return jsonify(records), 200


if __name__ == '__main__':
    app.run(debug=True)
